import Add from "@mui/icons-material/Add";
import Badge from "@mui/icons-material/Badge";
import BrightnessAuto from "@mui/icons-material/BrightnessAuto";
import CalendarToday from "@mui/icons-material/CalendarToday";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import DarkMode from "@mui/icons-material/DarkMode";
import Description from "@mui/icons-material/Description";
import EventAvailable from "@mui/icons-material/EventAvailable";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Functions from "@mui/icons-material/Functions";
import HistoryEdu from "@mui/icons-material/HistoryEdu";
import Inbox from "@mui/icons-material/Inbox";
import LibraryMusic from "@mui/icons-material/LibraryMusic";
import LightMode from "@mui/icons-material/LightMode";
import Lock from "@mui/icons-material/Lock";
import Login from "@mui/icons-material/Login";
import Logout from "@mui/icons-material/Logout";
import Radio from "@mui/icons-material/Radio";
import Repeat from "@mui/icons-material/Repeat";
import Save from "@mui/icons-material/Save";
import Schedule from "@mui/icons-material/Schedule";
import Search from "@mui/icons-material/Search";
import SettingsInputAntenna from "@mui/icons-material/SettingsInputAntenna";
import SettingsInputComponent from "@mui/icons-material/SettingsInputComponent";
import Sync from "@mui/icons-material/Sync";
import Terminal from "@mui/icons-material/Terminal";
import type { SvgIconComponent } from "@mui/icons-material";

/** Nombres usados en la app → iconos @mui/icons-material */
export const ICONS = {
  add: Add,
  badge: Badge,
  brightness_auto: BrightnessAuto,
  calendar_today: CalendarToday,
  check_circle: CheckCircle,
  close: Close,
  dark_mode: DarkMode,
  description: Description,
  event_available: EventAvailable,
  expand_more: ExpandMore,
  functions: Functions,
  history_edu: HistoryEdu,
  inbox: Inbox,
  library_music: LibraryMusic,
  light_mode: LightMode,
  lock: Lock,
  login: Login,
  logout: Logout,
  radio: Radio,
  repeat: Repeat,
  save: Save,
  schedule: Schedule,
  search: Search,
  settings_input_antenna: SettingsInputAntenna,
  settings_input_component: SettingsInputComponent,
  sync: Sync,
  terminal: Terminal,
} as const satisfies Record<string, SvgIconComponent>;

export type IconName = keyof typeof ICONS;
