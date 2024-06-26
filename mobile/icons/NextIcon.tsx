import { Path, Svg } from "react-native-svg"
import { useColorTheme } from "../hooks/useColorTheme"

export function NextIcon() {
  const { foreground } = useColorTheme()

  return (
    <Svg width="33" height="32" viewBox="0 0 33 32" fill="none">
      <Path
        d="M23.1667 6.66699V25.3337M8.5 14.0954V17.9052C8.5 20.3413 8.5 21.5594 9.01139 22.2613C9.45742 22.8735 10.1423 23.2665 10.8958 23.3433C11.7598 23.4314 12.8124 22.8176 14.9167 21.5901L18.1822 19.6852L18.1935 19.6787C20.2622 18.472 21.2972 17.8682 21.646 17.0811C21.9508 16.3931 21.9508 15.6086 21.646 14.9207C21.2966 14.1321 20.2584 13.5265 18.1822 12.3154L14.9167 10.4105C12.8125 9.18302 11.7598 8.569 10.8958 8.65707C10.1423 8.73388 9.45742 9.12774 9.01139 9.73991C8.5 10.4418 8.5 11.6593 8.5 14.0954Z"
        stroke={foreground}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
