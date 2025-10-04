import { Module } from "@nestjs/common";
import { BlockNoteService } from "src/core/blocknote/services/blocknote.service";

@Module({
  providers: [BlockNoteService],
  exports: [BlockNoteService],
})
export class BlockNoteModule {}
