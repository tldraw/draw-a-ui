/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../../PreviewShape/PreviewShape'
import '../../Slides/slides.css'
import { APIKeyInput } from '../../components/APIKeyInput'

import { TLUiOverrides, computed } from 'tldraw'
import { SlideShapeTool } from '../../Slides/SlideShapeTool'
import { SlideShapeUtil } from '../../Slides/SlideShapeUtil'
import { SlidesPanel } from '../../Slides/SlidesPanel'
import { $currentSlide, getSlides, moveToSlide } from '../../Slides/useSlides'
import { LinkArea } from '../../components/LinkArea'
import { CarryOnButton } from '../../lib/carryOn'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const overrides: TLUiOverrides = {
	actions(editor, actions) {
		const $slides = computed('slides', () => getSlides(editor))
		return {
			...actions,
			'next-slide': {
				id: 'next-slide',
				label: 'Next slide',
				kbd: 'right',
				onSelect() {
					const slides = $slides.get()
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const nextSlide = slides[index + 1] ?? currentSlide ?? slides[0]
					if (nextSlide) {
						editor.stopCameraAnimation()
						moveToSlide(editor, nextSlide)
					}
				},
			},
			'previous-slide': {
				id: 'previous-slide',
				label: 'Previous slide',
				kbd: 'left',
				onSelect() {
					const slides = $slides.get()
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const previousSlide = slides[index - 1] ?? currentSlide ?? slides[slides.length - 1]
					if (previousSlide) {
						editor.stopCameraAnimation()
						moveToSlide(editor, previousSlide)
					}
				},
			},
		}
	},
	tools(editor, tools) {
		tools.slide = {
			id: 'slide',
			icon: 'group',
			label: 'Slide',
			kbd: 's',
			onSelect: () => editor.setCurrentTool('slide'),
		}
		return tools
	},
}

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw-demo"
				shapeUtils={[PreviewShapeUtil, SlideShapeUtil]}
				tools={[SlideShapeTool]}
				overrides={overrides}
				components={{
					SharePanel: CarryOnButton,
					HelperButtons: SlidesPanel,
					Minimap: null,
				}}
				onMount={(editor) => {
					window['editor'] = editor
				}}
			>
				<APIKeyInput />
				<LinkArea />
			</Tldraw>
		</div>
	)
}
