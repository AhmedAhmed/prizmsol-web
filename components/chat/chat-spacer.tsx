"use client"
import { useEffect, useRef, useState } from "react"

export function ChatSpacer() {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        const calculate = () => {
            if (!ref.current) return
            const top = ref.current.getBoundingClientRect().top
            const remaining = window.innerHeight - top
            setHeight(Math.max(remaining, 0))
        }

        calculate()

        const resizeObserver = new ResizeObserver(calculate)
        resizeObserver.observe(document.body)

        window.addEventListener("resize", calculate)
        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("resize", calculate)
        }
    }, [])

    return <div ref={ref} style={{ height }} />
}