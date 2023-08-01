import { Popover as PopoverUI } from "@mui/material";
import Box from "@mui/material/Box";

export default function Popover({
  anchorEl,
  open,
  handlePopoverClose,
  content,
}) {
  return (
    <div>
      <PopoverUI
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Box
          sx={{
            p: "10px",
          }}
        >
          {content}
        </Box>
      </PopoverUI>
    </div>
  );
}
