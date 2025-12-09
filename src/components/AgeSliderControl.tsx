import { withJsonFormsControlProps } from "@jsonforms/react";
import { Box, Typography, Slider } from "@mui/material";

interface AgeSliderControlProps {
  data: number;
  handleChange: (path: string, value: number) => void;
  path: string;
  label: string;
  errors?: string;
  visible?: boolean;
}

const AgeSliderControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
  visible = true,
}: AgeSliderControlProps) => {
  if (!visible) return null;

  const age = data || 18;

  return (
    <Box sx={{ my: 2, px: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Slider
          value={age}
          onChange={(_, value) => handleChange(path, value as number)}
          min={0}
          max={120}
          valueLabelDisplay="on"
          sx={{ flexGrow: 1 }}
        />
      </Box>
      {errors && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

export default withJsonFormsControlProps(AgeSliderControl);
