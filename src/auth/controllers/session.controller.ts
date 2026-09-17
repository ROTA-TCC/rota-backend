import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request as NestRequest,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from '../services/session.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import '../interfaces/express-request.interface';

class SessionResponse {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastActive: Date;
  isCurrent: boolean;
}

@ApiTags('Gerenciamento de Sessões')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Acesso negado. JWT inválido ou ausente.',
})
@Controller('auth/sessions')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TransformInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
  
  @Get()
  @ApiOperation({
    summary: 'Listar sessões ativas',
    description: 'Retorna uma lista de todos os dispositivos e navegadores onde o usuário está autenticado.',
  })
  @ApiOkResponse({
    description: 'Lista de sessões retornada com sucesso.',
    type: [SessionResponse],
  })
  async list(@NestRequest() req: Request) {
    return this.sessionService.list(req.user.sub);
  }
  
  @Delete('all-others')
  @ApiOperation({
    summary: 'Revogar outras sessões',
    description: 'Encerra todas as sessões do usuário, exceto a atual. Útil em caso de suspeita de invasão.',
  })
  @ApiOkResponse({ description: 'Demais sessões revogadas.' })
  async revokeAllOthers(@NestRequest() req: Request) {
    return this.sessionService.revokeAllOthers(
      req.user.sub,
      req.user.sessionId,
    );
  }
  
  @Delete('all')
  @ApiOperation({
    summary: 'Revogar todas as sessões',
    description: 'Encerra absolutamente todas as sessões do usuário, incluindo a atual.',
  })
  @ApiOkResponse({ description: 'Todas as sessões revogadas.' })
  async revokeAll(@NestRequest() req: Request) {
    return this.sessionService.revokeAll(req.user.sub);
  }
  
  @Delete(':id')
  @ApiOperation({
    summary: 'Revogar sessão específica',
    description: 'Encerra uma sessão específica através do seu ID único.',
  })
  @ApiOkResponse({ description: 'Sessão revogada com sucesso.' })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para revogar esta sessão.',
  })
  async revokeSession(@Param('id') id: string, @NestRequest() req: Request) {
    return this.sessionService.revokeSession(id, req.user.sub);
  }
}