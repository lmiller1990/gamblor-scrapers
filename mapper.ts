interface INameMap {
  [key: string]: string
}

const mapper: INameMap = {
  "excel esports": "xl",
  "fnatic": "fnc",
  "schalke 04": "s04",
  "misfits": "msf",
  "sk gaming": "sk",
  "rogue": "rge",
  "splyce": "spy",
  "origen": "og",
  "g2 esports": "g2",
  "team vitality": "vit"
}

const reverseMapper: INameMap = {
  "xl":   "excel esports",
  "fnc":   "fnatic",
  "s04":   "schalke 04",
  "msf":   "misfits",
  "sk":   "sk gaming",
  "rge":   "rogue",
  "spy":   "splyce",
  "og":   "origen",
  "g2":   "g2 esports",
  "vit":   "team vitality"
}

export {
  mapper,
  reverseMapper,
}
