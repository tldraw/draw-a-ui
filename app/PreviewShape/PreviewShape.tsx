/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	Icon,
	useToasts,
	stopEventPropagation,
	DefaultSpinner,
	defineMigrations,
} from '@tldraw/tldraw'
import { ChatCompletionMessage } from '../lib/getHtmlFromOpenAI'

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		source: string
		history: ChatCompletionMessage[]
		w: number
		h: number
	}
>
export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			source: '',
			history: [],
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false
	override canUnmount = () => false

	static migrations = defineMigrations({
		firstVersion: 0,
		currentVersion: 1,
		migrators: {
			[1]: {
				up: (shape: PreviewShape) => {
					shape.props.history = [{
						role: 'user',
						content: shape.props.source,
					}, {
						role: 'assistant',
						content: shape.props.html,
					}]
					return shape
				},
				down: (shape) => {
					delete shape.props.history
					return shape
				},
			},
		},
	})

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{shape.props.html ? (
					<iframe
						className="tl-embed"
						srcDoc={shape.props.html}
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							border: 0,
							pointerEvents: isEditing ? 'auto' : 'none',
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						if (navigator && navigator.clipboard) {
							navigator.clipboard.writeText(shape.props.html)
							toast.addToast({
								icon: 'code',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
					title="Copy code to clipboard"
				>
					<Icon icon="code" />
				</div>
				<div
					style={{
						textAlign: 'center',
						position: 'absolute',
						bottom: 0,
						padding: 4,
						fontFamily: 'inherit',
						fontSize: 12,
						left: 0,
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none',
					}}
				>
					{isEditing ? null : (
						<span
							style={{
								background: 'var(--color-background)',
								padding: '4px 12px',
								borderRadius: 99,
							}}
						>
							Double click to interact
						</span>
					)}
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
