import { useRef } from 'react'
import { fileToDataUrl } from '../utils/imageHelpers'

export function useImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = (onPick: (dataUrl: string) => void, multiple = false) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = multiple
    input.onchange = async () => {
      const files = Array.from(input.files ?? [])
      for (const file of files) {
        const url = await fileToDataUrl(file)
        onPick(url)
      }
    }
    input.click()
  }

  const pickMany = (onPick: (dataUrl: string) => void) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      const files = Array.from(input.files ?? [])
      for (const file of files) {
        const url = await fileToDataUrl(file)
        onPick(url)
      }
    }
    input.click()
  }

  return { inputRef, pick, pickMany }
}
