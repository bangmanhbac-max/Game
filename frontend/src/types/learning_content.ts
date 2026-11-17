export type StrokeGestureType = 
  | 'horizontal'  // Horizontal stroke (-)
  | 'vertical'    // Vertical stroke (|)
  | 'slash'       // Slash stroke (/)
  | 'backslash'   // Backslash stroke (\)
  | 'v_shape'     // V-Shape
  | 'caret'       // Caret stroke (^)
  | 'circle'      // Circle (O)
  | 'lightning';  // Lightning bolt (Z)

export interface VocabularyItem {
  id: string;
  target_text: string;     // e.g., 你好
  phonetic: string;        // e.g., nǐ hǎo
  type_target: string;     // e.g., nihao (keystroke target string)
  meaning: string;         // e.g., Hello
  example?: string;        // e.g., 你好！
  difficulty: number;      // 1-5
  stroke_gesture: StrokeGestureType;
  characters?: string[];   // e.g., ["你", "好"] glyph components for rune/magic games
  stroke_count?: number;   // estimated stroke count
}


export interface VocabularyDeck {
  id: string;
  title: string;
  description: string;
  target_language: string;
  items: VocabularyItem[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  points: number;
}

export interface QuizDeck {
  id: string;
  title: string;
  description: string;
  items: QuizItem[];
}

export interface LearningPackage {
  package_id: string;
  title: string;
  source_filename?: string;
  created_at: string;
  vocabulary_deck: VocabularyDeck;
  quiz_deck: QuizDeck;
}
