export interface FullItem {
    sub_icon: any
    mastery_level: number
    id: string
    icon: string
    trading_tax: number
    thumb: string
    tags: string[]
    set_root: boolean
    ducats: number
    url_name: string
    icon_format: string
    en: Language
  }
  
  export interface Language {
    item_name: string
    description: string
    wiki_link: string
    drop: any[]
  }