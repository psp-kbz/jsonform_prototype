import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

interface SchemaGeneratorProps {
  onSchemaGenerated: (schema: any) => void;
}

const SchemaGenerator = ({ onSchemaGenerated }: SchemaGeneratorProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const generateSchema = (data: any, path: string = "#"): any => {
    if (data === null) {
      return { type: "null" };
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return {
          type: "array",
          items: {},
        };
      }

      // Analyze all items to create a comprehensive schema
      const itemSchemas = data.map((item, index) =>
        generateSchema(item, `${path}/items/${index}`)
      );

      // Merge all item schemas
      const mergedItemSchema = mergeSchemas(itemSchemas);

      return {
        type: "array",
        items: mergedItemSchema,
      };
    }

    if (typeof data === "object") {
      const properties: any = {};
      const required: string[] = [];

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          
          // Check if field name ends with * to mark as required
          const isRequired = key.endsWith("*");
          const cleanKey = isRequired ? key.slice(0, -1) : key;
          
          // Check if value is null or empty string - make it optional
          const isOptional = value === null || value === "" || value === undefined;
          
          // Check if field name suggests file upload
          const isFileField = /^(file|image|photo|picture|avatar|document|attachment|upload)/i.test(cleanKey);
          
          let fieldSchema = generateSchema(value, `${path}/properties/${cleanKey}`);
          
          // If it's a file-related field name and string type, mark as file upload
          if (isFileField && (fieldSchema.type === "string" || value === "" || value === null)) {
            fieldSchema = { type: "string", format: "data-url" };
          }
          
          properties[cleanKey] = fieldSchema;
          
          // Add to required array if marked with * or has a non-empty value
          if (isRequired || (!isOptional && value !== null)) {
            required.push(cleanKey);
          }
        }
      }

      return {
        type: "object",
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    if (typeof data === "string") {
      // Check for common formats
      if (isEmail(data)) {
        return { type: "string", format: "email" };
      }
      if (isUrl(data)) {
        return { type: "string", format: "uri" };
      }
      if (isDate(data)) {
        return { type: "string", format: "date" };
      }
      if (isDateTime(data)) {
        return { type: "string", format: "date-time" };
      }
      return { type: "string" };
    }

    if (typeof data === "number") {
      return Number.isInteger(data) ? { type: "integer" } : { type: "number" };
    }

    if (typeof data === "boolean") {
      return { type: "boolean" };
    }

    return {};
  };

  const mergeSchemas = (schemas: any[]): any => {
    if (schemas.length === 0) return {};
    if (schemas.length === 1) return schemas[0];

    const firstSchema = schemas[0];
    const type = firstSchema.type;

    // If all schemas have the same type
    if (schemas.every((s) => s.type === type)) {
      if (type === "object") {
        const allProperties: any = {};
        const allRequired = new Set<string>();

        schemas.forEach((schema) => {
          if (schema.properties) {
            Object.keys(schema.properties).forEach((key) => {
              if (!allProperties[key]) {
                allProperties[key] = schema.properties[key];
              } else {
                allProperties[key] = mergeSchemas([
                  allProperties[key],
                  schema.properties[key],
                ]);
              }
            });
          }
          if (schema.required) {
            schema.required.forEach((key: string) => allRequired.add(key));
          }
        });

        return {
          type: "object",
          properties: allProperties,
          required: allRequired.size > 0 ? Array.from(allRequired) : undefined,
        };
      }

      return firstSchema;
    }

    // Mixed types - use anyOf
    return {
      anyOf: schemas,
    };
  };

  const isEmail = (str: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const isUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const isDate = (str: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
  };

  const isDateTime = (str: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str);
  };

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        ...generateSchema(parsed),
      };
      
      setError("");
      onSchemaGenerated(schema);
    } catch (err) {
      setError("Invalid JSON. Please check your input.");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AutoFixHighIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">Generate Form from JSON Data</Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter sample JSON data below to automatically generate a form. The system will analyze your data structure and create the appropriate form fields.
        <br />
        <strong>Tips:</strong>
        <br />
        • Fields with values are marked as required
        <br />
        • Set a field to <code>null</code> or <code>""</code> (empty string) to make it optional
        <br />
        • Add <code>*</code> at the end of a field name to force it as required (e.g., "email*")
        <br />
        • Use field names like <code>file</code>, <code>image</code>, <code>photo</code>, <code>picture</code>, <code>avatar</code>, <code>document</code>, or <code>attachment</code> to create file upload fields
      </Typography>

      <TextField
        multiline
        fullWidth
        rows={10}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='Example:\n{\n  "name*": "John Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "phone": null,\n  "bio": "",\n  "image": "",\n  "file": null,\n  "rating": 5\n}\n\n/* image, file = file upload fields */\n/* name, age, email, rating = required */\n/* phone, bio = optional */'
        error={!!error}
        sx={{
          mb: 2,
          "& textarea": {
            fontFamily: "monospace",
            fontSize: "13px",
          },
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={!jsonInput.trim()}
        startIcon={<AutoFixHighIcon />}
        size="large"
      >
        Generate Form from JSON
      </Button>
    </Paper>
  );
};

export default SchemaGenerator;
