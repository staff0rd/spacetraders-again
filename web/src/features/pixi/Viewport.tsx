import { PixiComponent, useApp } from '@pixi/react'
import { Viewport as PixiViewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import { PropsWithChildren } from 'react'

type ViewportProps = PropsWithChildren & {
  screenWidth: number
  screenHeight: number
  worldWidth: number
  worldHeight: number
}

type PixiComponentViewportProps = ViewportProps & {
  app: PIXI.Application
}

const PixiComponentViewport = PixiComponent('Viewport', {
  create: (props: PixiComponentViewportProps) => {
    console.log(`worldWidth: ${props.worldWidth}, worldHeight: ${props.worldHeight}`)
    const viewport = new PixiViewport({
      passiveWheel: false,
      screenWidth: props.screenWidth,
      screenHeight: props.screenHeight,
      worldWidth: props.worldWidth,
      worldHeight: props.worldHeight,
      //ticker: props.app.ticker,
      events: props.app.renderer.events,
    })
    viewport
      .drag({ underflow: 'center' })
      .pinch()
      .wheel({ interrupt: true })
      .clampZoom({ maxHeight: props.worldHeight + 200, maxWidth: props.worldWidth + 800 })
      .clamp({ underflow: 'center', bottom: true, left: true, right: true, top: true })

    return viewport
  },
})

const Viewport = (props: ViewportProps) => {
  const app = useApp()
  return <PixiComponentViewport app={app} {...props} />
}

export default Viewport
