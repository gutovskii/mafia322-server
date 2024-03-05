import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoomExistsPipe } from './room-exists.pipe';
import { RoomInterceptor } from './room.interceptor';
import { RoomService } from './room.service';

@Controller('room')
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @UseInterceptors(RoomInterceptor)
  find(
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('allStatuses', new DefaultValuePipe(false)) allStatuses: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(2), ParseIntPipe) limit: number,
  ) {
    return this.roomService.find({ page, limit, search, allStatuses });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe, RoomExistsPipe) id: string) {
    return this.roomService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe, RoomExistsPipe) id: string) {
    return this.roomService.delete(id);
  }
}
