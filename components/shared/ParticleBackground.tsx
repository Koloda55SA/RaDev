'use client'

import { useEffect } from 'react'

export default function ParticleBackground() {
  useEffect(() => {
    // Адаптивная оптимизация: отключаем частицы на медленных устройствах
    if (typeof window !== 'undefined') {
      // Проверяем производительность через hardwareConcurrency и memory (если доступно)
      const isSlowDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4
      if (isSlowDevice) {
        return // Не загружаем частицы на медленных устройствах
      }
      // Добавляем стили для canvas particles.js
      const style = document.createElement('style')
      style.id = 'particles-styles'
      style.textContent = `
        #particles-js {
          pointer-events: none !important;
          z-index: -1 !important;
          position: fixed !important;
        }
        #particles-js canvas {
          pointer-events: none !important;
          z-index: -1 !important;
          position: fixed !important;
        }
      `
      // Удаляем старый стиль если есть
      const oldStyle = document.getElementById('particles-styles')
      if (oldStyle) oldStyle.remove()
      document.head.appendChild(style)

      // @ts-ignore
      import('particles.js').then(() => {
        // @ts-ignore
        if (window.particlesJS) {
          // @ts-ignore
          window.particlesJS('particles-js', {
          particles: {
            number: {
              value: 50,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: '#00f0ff',
            },
            shape: {
              type: 'circle',
            },
            opacity: {
              value: 0.5,
              random: false,
            },
            size: {
              value: 3,
              random: true,
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#00f0ff',
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'out',
              bounce: false,
            },
          },
          interactivity: {
            detect_on: 'window',
            events: {
              onhover: {
                enable: false,
              },
              onclick: {
                enable: false,
              },
              resize: true,
            },
            modes: {
              grab: {
                enable: false,
              },
              bubble: {
                enable: false,
              },
              repulse: {
                enable: false,
              },
              push: {
                enable: false,
              },
              remove: {
                enable: false,
              },
            },
          },
          retina_detect: true,
        })
        }
      })
    }
  }, [])

  return (
    <div 
      id="particles-js" 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ zIndex: -1, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
