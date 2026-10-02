import { IsString, IsOptional, IsObject } from 'class-validator'

export class GeneratePdfDto {
  @IsString()
  content!: string

  @IsOptional()
  @IsString()
  format?: 'A4' | 'LETTER' | 'LEGAL'

  @IsOptional()
  @IsString()
  orientation?: 'PORTRAIT' | 'LANDSCAPE'

  @IsOptional()
  @IsObject()
  options?: {
    margin?: {
      top?: string
      right?: string
      bottom?: string
      left?: string
    }
    printBackground?: boolean
    displayHeaderFooter?: boolean
    headerTemplate?: string
    footerTemplate?: string
  }
}

export class GenerateFromUrlDto {
  @IsString()
  url!: string

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>
}

export class GenerateFromHtmlDto {
  @IsString()
  html!: string

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>
}
