import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter extends BaseExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    console.log(exception.message);
  }
}
