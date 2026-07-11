import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ReturnsService } from './returns.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';

@Controller('credit-notes')
export class CreditNotesController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll() {
    void this.returnsService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: CreateCreditNoteDto) {
    void this.returnsService;
    return { message: 'not implemented' };
  }
}
