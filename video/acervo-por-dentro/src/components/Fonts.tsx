import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

loadOutfit("normal", { weights: ["300", "400", "500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });
loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
