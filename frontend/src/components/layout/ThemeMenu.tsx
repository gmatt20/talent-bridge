import {Monitor, Moon, Sun} from 'lucide-react';
import {useTheme, type Theme} from '../../theme/ThemeContext';
import {Button} from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const OPTIONS: Array<{value: Theme; label: string; icon: typeof Sun}> = [
  {value: 'light', label: 'Light', icon: Sun},
  {value: 'dark', label: 'Dark', icon: Moon},
  {value: 'system', label: 'System', icon: Monitor},
];

/** A header button that switches between light, dark and system themes. */
export function ThemeMenu() {
  const {theme, resolvedTheme, setTheme} = useTheme();
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  const handleChange = (value: string) => {
    const option = OPTIONS.find(o => o.value === value);
    if (option) setTheme(option.value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Change theme"
        >
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleChange}>
          {OPTIONS.map(({value, label, icon: OptionIcon}) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptionIcon /> {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
