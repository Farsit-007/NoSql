import fs from 'fs';
import path from 'path';

// Function to create a module with dynamic files
const createModule = (moduleName: string): void => {
    const baseDir = path.join(__dirname, "../", 'app', 'modules', moduleName);
    console.log(__dirname, " dir name")
    
    // List of files to be created
    const files = [
        `${moduleName}.routes.ts`,
        `${moduleName}.controller.ts`,
        `${moduleName}.model.ts`,
        `${moduleName}.service.ts`,
        `${moduleName}.interface.ts`,
        `${moduleName}.validation.ts`,
        `${moduleName}.constant.ts`,
    ];

    // Create the module directory
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
        console.log(`Directory created: ${baseDir}`);
    } else {
        console.log(`Directory already exists: ${baseDir}`);
    }

    // Create each file with basic content
    files.forEach((file) => {
        const filePath = path.join(baseDir, file);
        if (!fs.existsSync(filePath)) {
            let content = '';
            const capitalizedName = capitalize(moduleName);

            // Basic template for each file
            if (file.endsWith('.routes.ts')) {
                content = `import express from 'express';
import { ${moduleName}Controller } from './${moduleName}.controller';
import { validation } from '../../middleware/validation';
import { ${moduleName}Validations } from './${moduleName}.validation';

const router = express.Router();

router.get(
  '/',
  ${moduleName}Controller.getAll${capitalizedName}s,
);

router.get(
  '/:id',
  ${moduleName}Controller.get${capitalizedName}ById,
);

router.post(
  '/create',
  validation(${moduleName}Validations.create${capitalizedName}),
  ${moduleName}Controller.create${capitalizedName},
);

router.patch(
  '/:id',
  validation(${moduleName}Validations.update${capitalizedName}),
  ${moduleName}Controller.update${capitalizedName},
);

router.delete(
  '/:id',
  ${moduleName}Controller.delete${capitalizedName},
);

export const ${capitalizedName}Routes = router;
`;
            } else if (file.endsWith('.controller.ts')) {
                content = `import { catchAsync } from '../../utils/catchAsync';
import { httpStatus } from '../../utils/httpStatus';
import sendResponse from '../../utils/sendResponse';
import { ${moduleName}Services } from './${moduleName}.service';

const create${capitalizedName} = catchAsync(async (req, res, next) => {
  const result = await ${moduleName}Services.create${capitalizedName}IntoDB(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: '${capitalizedName} created successfully',
    data: result,
  });
});

const getAll${capitalizedName}s = catchAsync(async (req, res, next) => {
  const result = await ${moduleName}Services.getAll${capitalizedName}sFromDB(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedName}s retrieved successfully',
    data: result,
  });
});

const get${capitalizedName}ById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await ${moduleName}Services.get${capitalizedName}ByIdFromDB(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedName} retrieved successfully',
    data: result,
  });
});

const update${capitalizedName} = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await ${moduleName}Services.update${capitalizedName}InDB(id, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedName} updated successfully',
    data: result,
  });
});

const delete${capitalizedName} = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await ${moduleName}Services.delete${capitalizedName}FromDB(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedName} deleted successfully',
    data: result,
  });
});

export const ${moduleName}Controller = {
  create${capitalizedName},
  getAll${capitalizedName}s,
  get${capitalizedName}ById,
  update${capitalizedName},
  delete${capitalizedName},
};
`;
            } else if (file.endsWith('.service.ts')) {
                content = `import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { httpStatus } from '../../utils/httpStatus';
import { T${capitalizedName} } from './${moduleName}.interface';
import { ${capitalizedName} } from './${moduleName}.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { ${moduleName.toUpperCase()}_SEARCHABLE_FIELDS } from './${moduleName}.constant';

const create${capitalizedName}IntoDB = async (payload: T${capitalizedName}) => {
  const result = await ${capitalizedName}.create(payload);
  return result;
};

const getAll${capitalizedName}sFromDB = async (query: Record<string, unknown>) => {
  const ${moduleName}Query = new QueryBuilder(${capitalizedName}.find(), query)
    .search(${moduleName.toUpperCase()}_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ${moduleName}Query.modelQuery;
  const meta = await ${moduleName}Query.countTotal();

  return {
    meta,
    result,
  };
};

const get${capitalizedName}ByIdFromDB = async (id: string) => {
  const result = await ${capitalizedName}.findById(id);
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, '${capitalizedName} not found');
  }
  
  return result;
};

const update${capitalizedName}InDB = async (id: string, payload: Partial<T${capitalizedName}>) => {
  const result = await ${capitalizedName}.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, '${capitalizedName} not found');
  }
  
  return result;
};

const delete${capitalizedName}FromDB = async (id: string) => {
  const result = await ${capitalizedName}.findByIdAndDelete(id);
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, '${capitalizedName} not found');
  }
  
  return result;
};

export const ${moduleName}Services = {
  create${capitalizedName}IntoDB,
  getAll${capitalizedName}sFromDB,
  get${capitalizedName}ByIdFromDB,
  update${capitalizedName}InDB,
  delete${capitalizedName}FromDB,
};
`;
            } else if (file.endsWith('.interface.ts')) {
                content = `import { Model } from 'mongoose';

export interface T${capitalizedName} {
  _id?: string;
  name: string;
  // Add more fields as needed
  isDeleted: boolean;
}

export interface ${capitalizedName}Model extends Model<T${capitalizedName}> {
  // Add static methods if needed
  is${capitalizedName}ExistsById(id: string): Promise<T${capitalizedName} | null>;
}
`;
            } else if (file.endsWith('.validation.ts')) {
                content = `import { z } from 'zod';

const create${capitalizedName} = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(1, 'Name cannot be empty'),
    // Add more validation fields as needed
  }),
});

const update${capitalizedName} = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    // Add more validation fields as needed
  }),
});

export const ${moduleName}Validations = {
  create${capitalizedName},
  update${capitalizedName},
};
`;
            } else if (file.endsWith('.constant.ts')) {
                content = `export const ${moduleName.toUpperCase()}_SEARCHABLE_FIELDS = ['name']; // Add searchable fields

export const ${moduleName.toUpperCase()}_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type T${capitalizedName}Status = keyof typeof ${moduleName.toUpperCase()}_STATUS;
`;
            } else if (file.endsWith('.model.ts')) {
                content = `import { model, Schema } from 'mongoose';
import { T${capitalizedName}, ${capitalizedName}Model } from './${moduleName}.interface';

const ${moduleName}Schema = new Schema<T${capitalizedName}, ${capitalizedName}Model>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Add more fields as needed
  },
  {
    timestamps: true,
  }
);

// Query Middleware to exclude deleted documents
${moduleName}Schema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

${moduleName}Schema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

${moduleName}Schema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Static method to check if ${moduleName} exists by ID
${moduleName}Schema.statics.is${capitalizedName}ExistsById = async function (id: string) {
  return await ${capitalizedName}.findOne({ _id: id, isDeleted: { $ne: true } });
};

export const ${capitalizedName} = model<T${capitalizedName}, ${capitalizedName}Model>('${capitalizedName}', ${moduleName}Schema);
`;
            }

            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`File created: ${filePath}`);
        } else {
            console.log(`File already exists: ${filePath}`);
        }
    });
};

// Utility function to capitalize the module name
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

// Get the module name from command-line arguments
const moduleName = process.argv[2];
if (!moduleName) {
    console.error('Please provide a module name.');
    console.error('Usage: npm run create-module <moduleName>');
    process.exit(1);
}

// Execute the function
createModule(moduleName.toLowerCase());