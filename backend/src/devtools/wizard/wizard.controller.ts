import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WizardService } from './wizard.service'
import type { DockerComposeResult, DockerContainer, SystemHealth } from './wizard.service'

@ApiTags('System Wizard')
@Controller('admin/wizard')
export class WizardController {
  constructor(private readonly wizardService: WizardService) {}

  @Get('steps')
  @ApiOperation({ summary: 'Get all wizard steps based on environment' })
  @ApiResponse({ status: 200, description: 'Wizard steps retrieved' })
  async getSteps(@Query('mode') mode?: 'development' | 'production'): Promise<any> {
    const selectedMode = mode || 'development'
    return this.wizardService.getWizardSteps(selectedMode)
  }

  @Post('steps/:stepId/execute')
  @ApiOperation({ summary: 'Execute a wizard step' })
  @ApiResponse({ status: 200, description: 'Step executed' })
  async executeStep(@Param('stepId') stepId: string): Promise<any> {
    return this.wizardService.executeStep(stepId)
  }

  @Post('management/reset-database')
  @ApiOperation({ summary: 'Reset database (DESTRUCTIVE)' })
  @ApiResponse({ status: 200, description: 'Database reset' })
  async resetDatabase() {
    return this.wizardService.resetDatabase()
  }

  @Post('management/reset-redis')
  @ApiOperation({ summary: 'Flush Redis cache' })
  @ApiResponse({ status: 200, description: 'Redis flushed' })
  async resetRedis() {
    return this.wizardService.resetRedis()
  }

  @Post('management/reset-all')
  @ApiOperation({ summary: 'Reset entire system (DESTRUCTIVE)' })
  @ApiResponse({ status: 200, description: 'Full reset' })
  async resetAll() {
    return this.wizardService.resetAll()
  }

  @Post('management/backup')
  @ApiOperation({ summary: 'Backup current state' })
  @ApiResponse({ status: 200, description: 'Backup created' })
  async backup() {
    return this.wizardService.backupCurrentState()
  }

  @Post('management/restore')
  @ApiOperation({ summary: 'Restore from backup' })
  @ApiResponse({ status: 200, description: 'Restore completed' })
  async restore(@Body() body: { backup: any }) {
    return this.wizardService.restoreFromBackup(body.backup)
  }

  @Post('management/stop-services')
  @ApiOperation({ summary: 'Stop all services' })
  @ApiResponse({ status: 200, description: 'Services stopped' })
  async stopServices() {
    return this.wizardService.stopServices()
  }

  @Post('management/restart-services')
  @ApiOperation({ summary: 'Restart all services' })
  @ApiResponse({ status: 200, description: 'Services restarted' })
  async restartServices() {
    return this.wizardService.restartServices()
  }

  @Post('management/clean-everything')
  @ApiOperation({ summary: 'Clean everything (DESTRUCTIVE)' })
  @ApiResponse({ status: 200, description: 'Everything cleaned' })
  async cleanEverything() {
    return this.wizardService.cleanEverything()
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getHealth(): Promise<SystemHealth> {
    return this.wizardService.getSystemHealth()
  }

  // Docker Management Endpoints

  @Get('docker/containers')
  @ApiOperation({ summary: 'Get all Docker containers' })
  @ApiResponse({ status: 200, description: 'Containers retrieved' })
  async getDockerContainers(): Promise<DockerContainer[]> {
    return this.wizardService.getDockerContainers()
  }

  @Post('docker/containers/:id/start')
  @ApiOperation({ summary: 'Start a Docker container' })
  @ApiResponse({ status: 200, description: 'Container started' })
  async startContainer(@Param('id') id: string) {
    return this.wizardService.startContainer(id)
  }

  @Post('docker/containers/:id/stop')
  @ApiOperation({ summary: 'Stop a Docker container' })
  @ApiResponse({ status: 200, description: 'Container stopped' })
  async stopContainer(@Param('id') id: string) {
    return this.wizardService.stopContainer(id)
  }

  @Post('docker/containers/:id/restart')
  @ApiOperation({ summary: 'Restart a Docker container' })
  @ApiResponse({ status: 200, description: 'Container restarted' })
  async restartContainer(@Param('id') id: string) {
    return this.wizardService.restartContainer(id)
  }

  @Get('docker/containers/:id/logs')
  @ApiOperation({ summary: 'Get container logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved' })
  async getContainerLogs(@Param('id') id: string, @Query('tail') tail?: number) {
    return this.wizardService.getContainerLogs(id, tail || 100)
  }

  @Post('docker/compose')
  @ApiOperation({ summary: 'Execute docker-compose command' })
  @ApiResponse({ status: 200, description: 'Command executed' })
  async executeDockerCompose(@Body() body: { command: string }): Promise<DockerComposeResult> {
    return this.wizardService.executeDockerCompose(body.command)
  }

  @Post('docker/backend-command')
  @ApiOperation({ summary: 'Execute command in backend container' })
  @ApiResponse({ status: 200, description: 'Command executed' })
  async executeBackendCommand(@Body() body: { command: string }) {
    return this.wizardService.executeBackendCommand(body.command)
  }

  @Get('docker/info')
  @ApiOperation({ summary: 'Get Docker system information' })
  @ApiResponse({ status: 200, description: 'Docker info retrieved' })
  async getDockerInfo() {
    return this.wizardService.getDockerInfo()
  }

  @Get('project-changes')
  @ApiOperation({ summary: 'Detect project structure changes' })
  @ApiResponse({ status: 200, description: 'Project changes detected' })
  async detectProjectChanges() {
    return this.wizardService.detectProjectChanges()
  }

  @Post('restart-action')
  @ApiOperation({ summary: 'Execute restart action' })
  @ApiResponse({ status: 200, description: 'Action executed' })
  async executeRestartAction(@Body() body: { action: string }) {
    return this.wizardService.executeRestartAction(body.action)
  }
}
