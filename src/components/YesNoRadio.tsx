import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
interface YesNoProps {
    value: boolean | null;
    onChange: (value: boolean) => void;
    label?: string; // Optional label for the group
  }
export default function YesNoRadio({ value, onChange, label = "Select an option" }: YesNoProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value === 'yes');
    };
  
    return (
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">{label}</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={value === true ? 'yes' : value === false ? 'no' : ''}
          onChange={handleChange}
          row // Makes the buttons horizontal
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>
    );
  }