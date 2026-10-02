import { NestFactory } from '@nestjs/core'
import { writeFile } from 'node:fs/promises'
import { AppModule } from '../src/app.module'
import { buildOpenApiDocument } from '../src/common/swagger/openapi'

async function exportSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false })
  const document = buildOpenApiDocument(app)
  await writeFile(
    'docs/contracts/generated-openapi.json',
    JSON.stringify(document, null, 2),
    'utf8'
  )
  await app.close()
  console.log('OpenAPI exported to docs/contracts/generated-openapi.json')
}

void exportSwagger().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
