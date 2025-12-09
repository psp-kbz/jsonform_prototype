import { withJsonFormsControlProps } from "@jsonforms/react";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface RatingControlProps {
  data: number;
  handleChange: (path: string, value: number) => void;
  path: string;
  label: string;
  errors?: string;
  visible?: boolean;
}

const RatingControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
  visible = true,
}: RatingControlProps) => {
  if (!visible) return null;

  const rating = data || 0;

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            onClick={() => handleChange(path, star)}
            sx={{
              cursor: "pointer",
              color: "primary.main",
              "&:hover": { opacity: 0.7 },
            }}
          >
            {star <= rating ? (
              <StarIcon fontSize="large" />
            ) : (
              <StarBorderIcon fontSize="large" />
            )}
          </Box>
        ))}
      </Box>
      {errors && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

export default withJsonFormsControlProps(RatingControl);
