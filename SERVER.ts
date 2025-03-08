// File structure
/*
bug-report-backend/
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # NestJS application Docker container
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── package.json              # Dependencies and scripts
├── nest-cli.json             # NestJS CLI configuration
├── tsconfig.json             # TypeScript configuration
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Database seeding
├── src/
│   ├── main.ts               # Application entry point
│   ├── app.module.ts         # Root application module
│   ├── prisma/               # Prisma service
│   │   ├── prisma.module.ts  # Prisma module
│   │   └── prisma.service.ts # Prisma service
│   ├── bugs/                 # Bugs module
│   │   ├── bugs.module.ts    # Bugs module definition
│   │   ├── bugs.controller.ts# API endpoints for bugs
│   │   ├── bugs.service.ts   # Business logic for bugs
│   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── create-bug.dto.ts
│   │   │   └── update-bug.dto.ts
│   │   └── entities/         # Entity definitions
│   │       └── bug.entity.ts
│   └── common/               # Shared code
│       ├── decorators/       # Custom decorators
│       ├── filters/          # Exception filters
│       ├── interceptors/     # Interceptors
│       └── utils/            # Utility functions
*/

// docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bug-report-api
    ports:
      - '5000:5000'
    depends_on:
      - postgres
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - bug-report-network
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: bug-report-postgres
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - bug-report-network
    restart: unless-stopped

networks:
  bug-report-network:
    driver: bridge

volumes:
  postgres-data:

// Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "dist/main"]

// .env.example
# App
PORT=5000
NODE_ENV=development
API_PREFIX=api

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bug_report_db
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bug_report_db?schema=public

// package.json
{
  "name": "bug-report-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.1.17",
    "@prisma/client": "^5.7.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "helmet": "^7.1.0",
    "nestjs-prisma": "^0.22.0",
    "reflect-metadata": "^0.1.14",
    "rimraf": "^5.0.5",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.5",
    "@types/supertest": "^2.0.16",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "prisma": "^5.7.1",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}

// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Bug {
  id          String   @id @default(uuid())
  description String
  imageUrl    String?
  status      BugStatus
  comment     String?
  responsible ResponsibleParty
  urls        BugUrl[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("bugs")
}

model BugUrl {
  id      String @id @default(uuid())
  url     String
  bug     Bug    @relation(fields: [bugId], references: [id], onDelete: Cascade)
  bugId   String

  @@map("bug_urls")
}

enum BugStatus {
  Open
  InProgress
  Fixed
  WontFix
  Duplicate

  @@map("bug_status")
}

enum ResponsibleParty {
  Frontend
  Backend
  PM
  Design
  QA

  @@map("responsible_party")
}

// prisma/seed.ts
import { PrismaClient, BugStatus, ResponsibleParty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.bugUrl.deleteMany();
  await prisma.bug.deleteMany();

  console.log('Seeding database...');

  // Create sample bugs
  const bug1 = await prisma.bug.create({
    data: {
      description: 'Navigation menu doesn\'t work on mobile devices',
      imageUrl: 'https://placekitten.com/800/600',
      status: BugStatus.Open,
      comment: 'Reproduced on iPhone 13 with iOS 16',
      responsible: ResponsibleParty.Frontend,
      urls: {
        create: [
          { url: 'https://example.com/dashboard' },
          { url: 'https://example.com/settings' }
        ]
      }
    }
  });

  const bug2 = await prisma.bug.create({
    data: {
      description: 'API returns 500 error when trying to update user profile',
      imageUrl: 'https://placekitten.com/900/600',
      status: BugStatus.InProgress,
      comment: 'Seems to be related to database constraints',
      responsible: ResponsibleParty.Backend,
      urls: {
        create: [
          { url: 'https://example.com/api/users/1' }
        ]
      }
    }
  });

  console.log({ bug1, bug2 });
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get config
  const configService = app.get('CONFIG');
  const port = configService.port || 5000;
  const apiPrefix = configService.apiPrefix || 'api';

  // Set global prefix
  app.setGlobalPrefix(apiPrefix);
  
  // Enable CORS
  app.enableCors();
  
  // Use Helmet for security headers
  app.use(helmet());
  
  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Bug Report API')
    .setDescription('API documentation for the Bug Report application')
    .setVersion('1.0')
    .addTag('bugs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BugsModule } from './bugs/bugs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    BugsModule,
  ],
  providers: [
    {
      provide: 'CONFIG',
      useFactory: (configService: ConfigService) => ({
        port: configService.get<number>('PORT'),
        apiPrefix: configService.get<string>('API_PREFIX'),
        nodeEnv: configService.get<string>('NODE_ENV'),
      }),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}

// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter(key => {
      return typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$');
    });

    return Promise.all(
      models.map(modelKey => {
        return this[modelKey as string].deleteMany();
      }),
    );
  }
}

// src/bugs/bugs.module.ts
import { Module } from '@nestjs/common';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';

@Module({
  controllers: [BugsController],
  providers: [BugsService],
})
export class BugsModule {}

// src/bugs/entities/bug.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Bug as PrismaBug, BugStatus, ResponsibleParty } from '@prisma/client';

export class BugUrl {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'https://example.com/page-with-bug' })
  url: string;
}

export class Bug implements PrismaBug {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Navigation menu doesn\'t work on mobile devices' })
  description: string;

  @ApiProperty({ example: 'https://storage.example.com/bug-screenshots/image.png', required: false })
  imageUrl: string | null;

  @ApiProperty({ enum: BugStatus, example: BugStatus.Open })
  status: BugStatus;

  @ApiProperty({ example: 'Reproduced on iPhone 13 with iOS 16', required: false })
  comment: string | null;

  @ApiProperty({ enum: ResponsibleParty, example: ResponsibleParty.Frontend })
  responsible: ResponsibleParty;

  @ApiProperty({ type: [BugUrl] })
  urls: BugUrl[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

// src/bugs/dto/create-bug.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { BugStatus, ResponsibleParty } from '@prisma/client';

export class CreateBugUrlDto {
  @ApiProperty({ example: 'https://example.com/page-with-bug' })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class CreateBugDto {
  @ApiProperty({ example: 'Navigation menu doesn\'t work on mobile devices' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [CreateBugUrlDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateBugUrlDto)
  urls: CreateBugUrlDto[];

  @ApiProperty({ example: 'https://storage.example.com/bug-screenshots/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ enum: BugStatus, example: BugStatus.Open })
  @IsEnum(BugStatus)
  status: BugStatus;

  @ApiProperty({ example: 'Reproduced on iPhone 13 with iOS 16', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ enum: ResponsibleParty, example: ResponsibleParty.Frontend })
  @IsEnum(ResponsibleParty)
  responsible: ResponsibleParty;
}

// src/bugs/dto/update-bug.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateBugDto } from './create-bug.dto';

export class UpdateBugDto extends PartialType(CreateBugDto) {}

// src/bugs/bugs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Bug, BugUrl } from './entities/bug.entity';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';

@Injectable()
export class BugsService {
  constructor(private prisma: PrismaService) {}

  async create(createBugDto: CreateBugDto): Promise<Bug> {
    const { urls, ...bugData } = createBugDto;

    return this.prisma.bug.create({
      data: {
        ...bugData,
        urls: {
          create: urls,
        },
      },
      include: {
        urls: true,
      },
    });
  }

  async findAll(): Promise<Bug[]> {
    return this.prisma.bug.findMany({
      include: {
        urls: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Bug> {
    const bug = await this.prisma.bug.findUnique({
      where: { id },
      include: {
        urls: true,
      },
    });

    if (!bug) {
      throw new NotFoundException(`Bug with ID ${id} not found`);
    }

    return bug;
  }

  async update(id: string, updateBugDto: UpdateBugDto): Promise<Bug> {
    // Check if bug exists
    await this.findOne(id);

    const { urls, ...bugData } = updateBugDto;

    // Start a transaction to ensure data consistency
    return this.prisma.$transaction(async (tx) => {
      // Update bug data
      const updatedBug = await tx.bug.update({
        where: { id },
        data: bugData,
        include: {
          urls: true,
        },
      });

      // If URLs are provided, update them
      if (urls && urls.length > 0) {
        // Delete existing URLs
        await tx.bugUrl.deleteMany({
          where: { bugId: id },
        });

        // Create new URLs
        await Promise.all(
          urls.map((urlData) =>
            tx.bugUrl.create({
              data: {
                ...urlData,
                bugId: id,
              },
            }),
          ),
        );

        // Fetch the updated bug with new URLs
        return tx.bug.findUnique({
          where: { id },
          include: {
            urls: true,
          },
        });
      }

      return updatedBug;
    });
  }

  async remove(id: string): Promise<void> {
    // Check if bug exists
    await this.findOne(id);

    // Delete the bug (URLs will be cascade deleted due to the schema relation)
    await this.prisma.bug.delete({
      where: { id },
    });
  }
}

// src/bugs/bugs.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BugsService } from './bugs.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { Bug } from './entities/bug.entity';

@ApiTags('bugs')
@Controller('bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bug report' })
  @ApiBody({ type: CreateBugDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The bug has been successfully created.',
    type: Bug,
  })
  create(@Body() createBugDto: CreateBugDto): Promise<Bug> {
    return this.bugsService.create(createBugDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bug reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all bug reports',
    type: [Bug],
  })
  findAll(): Promise<Bug[]> {
    return this.bugsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bug report by ID' })
  @ApiParam({ name: 'id', description: 'Bug ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The bug report',
    type: Bug,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bug not found',
  })
  findOne(@Param('id') id: string): Promise<Bug> {
    return this.bugsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bug report' })
  @ApiParam({ name: 'id', description: 'Bug ID' })
  @ApiBody({ type: UpdateBugDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The bug has been successfully updated.',
    type: Bug,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bug not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateBugDto: UpdateBugDto,
  ): Promise<Bug> {
    return this.bugsService.update(id, updateBugDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bug report' })
  @ApiParam({ name: 'id', description: 'Bug ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The bug has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bug not found',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.bugsService.remove(id);
  }
}