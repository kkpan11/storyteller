import { Path, Svg } from "react-native-svg"
import { useColorTheme } from "../hooks/useColorTheme"

type Props = {
  filled?: boolean
}

export function BookmarkIcon({ filled }: Props) {
  const { foreground } = useColorTheme()

  return filled ? (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill={foreground}>
      <Path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" />
    </Svg>
  ) : (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill={foreground}>
      <Path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
    </Svg>
  )
}
