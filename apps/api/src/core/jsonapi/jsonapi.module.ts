import { Module } from "@nestjs/common";
import { DynamicRelationshipFactory } from "src/core/jsonapi/factories/dynamic.relationship.factory";
import { JsonApiSerialiserFactory } from "src/core/jsonapi/factories/jsonapi.serialiser.factory";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";

@Module({
  providers: [JsonApiService, JsonApiSerialiserFactory, DynamicRelationshipFactory],
  exports: [JsonApiService, JsonApiSerialiserFactory, DynamicRelationshipFactory],
})
export class JsonApiModule {}
