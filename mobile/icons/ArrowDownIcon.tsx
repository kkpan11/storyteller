import { Path, Svg } from "react-native-svg"
import { useColorTheme } from "../hooks/useColorTheme"

export function ArrowDownIcon() {
  const { foreground } = useColorTheme()

  return (
    <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      <Path
        d="M8.0003 3.7998V12.1998M8.0003 12.1998L11.6003 8.5998M8.0003 12.1998L4.4003 8.5998"
        stroke={foreground}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
