export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bowl_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          meal_type: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          meal_type: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          meal_type?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowl_templates_meal_type_fkey"
            columns: ["meal_type"]
            isOneToOne: false
            referencedRelation: "meal_types"
            referencedColumns: ["slug"]
          },
        ]
      }
      entity_translations: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field: string
          id: string
          locale: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field: string
          id?: string
          locale: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field?: string
          id?: string
          locale?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      ingestion_raw: {
        Row: {
          book_slug: string
          created_at: string
          id: string
          page_no: number
          raw_json: Json
          recipe_id: string | null
          run_id: string
        }
        Insert: {
          book_slug: string
          created_at?: string
          id?: string
          page_no: number
          raw_json: Json
          recipe_id?: string | null
          run_id: string
        }
        Update: {
          book_slug?: string
          created_at?: string
          id?: string
          page_no?: number
          raw_json?: Json
          recipe_id?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_raw_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_raw_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          errors_count: number
          finished_at: string | null
          id: string
          invoker: string
          output_summary: Json | null
          pages_processed: number
          products_inserted: number
          prompt_or_summary: string | null
          recipes_inserted: number
          run_type: string
          source_label: string
          started_at: string
        }
        Insert: {
          errors_count?: number
          finished_at?: string | null
          id?: string
          invoker: string
          output_summary?: Json | null
          pages_processed?: number
          products_inserted?: number
          prompt_or_summary?: string | null
          recipes_inserted?: number
          run_type: string
          source_label: string
          started_at?: string
        }
        Update: {
          errors_count?: number
          finished_at?: string | null
          id?: string
          invoker?: string
          output_summary?: Json | null
          pages_processed?: number
          products_inserted?: number
          prompt_or_summary?: string | null
          recipes_inserted?: number
          run_type?: string
          source_label?: string
          started_at?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          max_uses: number
          note: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          max_uses?: number
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          max_uses?: number
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          used_count?: number
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_liked: boolean | null
          meal_plan_id: string
          meal_type: string
          position_in_swipe_stack: number
          recipe_id: string | null
          servings: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_liked?: boolean | null
          meal_plan_id: string
          meal_type: string
          position_in_swipe_stack?: number
          recipe_id?: string | null
          servings?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_liked?: boolean | null
          meal_plan_id?: string
          meal_type?: string
          position_in_swipe_stack?: number
          recipe_id?: string | null
          servings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_meal_type_fkey"
            columns: ["meal_type"]
            isOneToOne: false
            referencedRelation: "meal_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          approved_at: string | null
          created_at: string
          generated_at: string
          id: string
          status: string
          strategy_notes: string | null
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          status?: string
          strategy_notes?: string | null
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          status?: string
          strategy_notes?: string | null
          updated_at?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      meal_types: {
        Row: {
          position: number
          slug: string
        }
        Insert: {
          position: number
          slug: string
        }
        Update: {
          position?: number
          slug?: string
        }
        Relationships: []
      }
      prep_sessions: {
        Row: {
          actual_minutes: number | null
          created_at: string
          estimated_minutes: number | null
          id: string
          meal_plan_id: string
          notes: string | null
          prep_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_minutes?: number | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          meal_plan_id: string
          notes?: string | null
          prep_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_minutes?: number | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          meal_plan_id?: string
          notes?: string | null
          prep_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_sessions_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_task_consumed_by: {
        Row: {
          meal_plan_item_id: string
          prep_task_id: string
          qty_used: number
          unit: string
        }
        Insert: {
          meal_plan_item_id: string
          prep_task_id: string
          qty_used: number
          unit: string
        }
        Update: {
          meal_plan_item_id?: string
          prep_task_id?: string
          qty_used?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_task_consumed_by_meal_plan_item_id_fkey"
            columns: ["meal_plan_item_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_task_consumed_by_prep_task_id_fkey"
            columns: ["prep_task_id"]
            isOneToOne: false
            referencedRelation: "prep_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          estimated_minutes: number | null
          id: string
          is_completed: boolean
          output_product_id: string | null
          output_quantity: number | null
          output_unit: string | null
          prep_recipe_id: string | null
          prep_session_id: string
          task_order: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_completed?: boolean
          output_product_id?: string | null
          output_quantity?: number | null
          output_unit?: string | null
          prep_recipe_id?: string | null
          prep_session_id: string
          task_order: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_completed?: boolean
          output_product_id?: string | null
          output_quantity?: number | null
          output_unit?: string | null
          prep_recipe_id?: string | null
          prep_session_id?: string
          task_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_tasks_output_product_id_fkey"
            columns: ["output_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_tasks_prep_recipe_id_fkey"
            columns: ["prep_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_tasks_prep_session_id_fkey"
            columns: ["prep_session_id"]
            isOneToOne: false
            referencedRelation: "prep_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_assignments: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          slug: string
          tag_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          tag_type: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          tag_type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_unit: string
          carbs_g_per_100g: number | null
          category: string
          created_at: string
          created_by_user_id: string | null
          fat_g_per_100g: number | null
          id: string
          is_active: boolean
          kcal_per_100g: number | null
          protein_g_per_100g: number | null
          recipe_id: string | null
          slug: string
          storage_days: number | null
          updated_at: string
        }
        Insert: {
          base_unit?: string
          carbs_g_per_100g?: number | null
          category: string
          created_at?: string
          created_by_user_id?: string | null
          fat_g_per_100g?: number | null
          id?: string
          is_active?: boolean
          kcal_per_100g?: number | null
          protein_g_per_100g?: number | null
          recipe_id?: string | null
          slug: string
          storage_days?: number | null
          updated_at?: string
        }
        Update: {
          base_unit?: string
          carbs_g_per_100g?: number | null
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          fat_g_per_100g?: number | null
          id?: string
          is_active?: boolean
          kcal_per_100g?: number | null
          protein_g_per_100g?: number | null
          recipe_id?: string | null
          slug?: string
          storage_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          calorie_target: number | null
          cooking_effort_level: string
          created_at: string
          diet_tags: string[]
          display_name: string | null
          equipment: string[]
          excluded_ingredients: string[]
          goal: string
          household_adults: number
          household_children: number
          locale: string
          onboarded_at: string | null
          prep_days: number[]
          updated_at: string
          user_id: string
        }
        Insert: {
          calorie_target?: number | null
          cooking_effort_level?: string
          created_at?: string
          diet_tags?: string[]
          display_name?: string | null
          equipment?: string[]
          excluded_ingredients?: string[]
          goal?: string
          household_adults?: number
          household_children?: number
          locale?: string
          onboarded_at?: string | null
          prep_days?: number[]
          updated_at?: string
          user_id: string
        }
        Update: {
          calorie_target?: number | null
          cooking_effort_level?: string
          created_at?: string
          diet_tags?: string[]
          display_name?: string | null
          equipment?: string[]
          excluded_ingredients?: string[]
          goal?: string
          household_adults?: number
          household_children?: number
          locale?: string
          onboarded_at?: string | null
          prep_days?: number[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          alt_for_ingredient_no: number | null
          amount: number | null
          ingredient_no: number
          is_optional: boolean
          note: string | null
          product_id: string
          recipe_id: string
          role_tag: string | null
          unit: string | null
        }
        Insert: {
          alt_for_ingredient_no?: number | null
          amount?: number | null
          ingredient_no: number
          is_optional?: boolean
          note?: string | null
          product_id: string
          recipe_id: string
          role_tag?: string | null
          unit?: string | null
        }
        Update: {
          alt_for_ingredient_no?: number | null
          amount?: number | null
          ingredient_no?: number
          is_optional?: boolean
          note?: string | null
          product_id?: string
          recipe_id?: string
          role_tag?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_alt_for_ingredient_no_fkey"
            columns: ["recipe_id", "alt_for_ingredient_no"]
            isOneToOne: false
            referencedRelation: "recipe_ingredients"
            referencedColumns: ["recipe_id", "ingredient_no"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_meal_types: {
        Row: {
          meal_type: string
          recipe_id: string
        }
        Insert: {
          meal_type: string
          recipe_id: string
        }
        Update: {
          meal_type?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_meal_types_meal_type_fkey"
            columns: ["meal_type"]
            isOneToOne: false
            referencedRelation: "meal_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "recipe_meal_types_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_pairings: {
        Row: {
          note: string | null
          paired_recipe_id: string
          recipe_id: string
          role: string
        }
        Insert: {
          note?: string | null
          paired_recipe_id: string
          recipe_id: string
          role: string
        }
        Update: {
          note?: string | null
          paired_recipe_id?: string
          recipe_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_pairings_paired_recipe_id_fkey"
            columns: ["paired_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_pairings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          carbs_g_per_100g: number | null
          cook_minutes: number | null
          cool_minutes: number | null
          country: string | null
          created_at: string
          fat_g_per_100g: number | null
          hero_image_url: string | null
          id: string
          is_active: boolean
          kcal_per_100g: number | null
          kcal_per_portion: number | null
          kind: string
          output_product_id: string | null
          portion_g: number | null
          prep_minutes: number | null
          protein_g_per_100g: number | null
          servings: number
          slug: string
          source_book_slug: string
          source_page: number | null
          source_pipeline: string
          storage_text: string | null
          total_yield_g: number | null
          updated_at: string
        }
        Insert: {
          carbs_g_per_100g?: number | null
          cook_minutes?: number | null
          cool_minutes?: number | null
          country?: string | null
          created_at?: string
          fat_g_per_100g?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          kcal_per_100g?: number | null
          kcal_per_portion?: number | null
          kind: string
          output_product_id?: string | null
          portion_g?: number | null
          prep_minutes?: number | null
          protein_g_per_100g?: number | null
          servings?: number
          slug: string
          source_book_slug: string
          source_page?: number | null
          source_pipeline: string
          storage_text?: string | null
          total_yield_g?: number | null
          updated_at?: string
        }
        Update: {
          carbs_g_per_100g?: number | null
          cook_minutes?: number | null
          cool_minutes?: number | null
          country?: string | null
          created_at?: string
          fat_g_per_100g?: number | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          kcal_per_100g?: number | null
          kcal_per_portion?: number | null
          kind?: string
          output_product_id?: string | null
          portion_g?: number | null
          prep_minutes?: number | null
          protein_g_per_100g?: number | null
          servings?: number
          slug?: string
          source_book_slug?: string
          source_page?: number | null
          source_pipeline?: string
          storage_text?: string | null
          total_yield_g?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_output_product_id_fkey"
            columns: ["output_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_recipe_candidates: {
        Row: {
          recipe_id: string
          template_slot_id: string
          weight: number
        }
        Insert: {
          recipe_id: string
          template_slot_id: string
          weight?: number
        }
        Update: {
          recipe_id?: string
          template_slot_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "slot_recipe_candidates_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_recipe_candidates_template_slot_id_fkey"
            columns: ["template_slot_id"]
            isOneToOne: false
            referencedRelation: "template_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      supported_locales: {
        Row: {
          display_name: string
          enabled: boolean
          is_default: boolean
          locale: string
        }
        Insert: {
          display_name: string
          enabled?: boolean
          is_default?: boolean
          locale: string
        }
        Update: {
          display_name?: string
          enabled?: boolean
          is_default?: boolean
          locale?: string
        }
        Relationships: []
      }
      template_slots: {
        Row: {
          accepted_role_tags: string[]
          bowl_template_id: string
          id: string
          is_required: boolean
          position: number
          slot_key: string
        }
        Insert: {
          accepted_role_tags?: string[]
          bowl_template_id: string
          id?: string
          is_required?: boolean
          position: number
          slot_key: string
        }
        Update: {
          accepted_role_tags?: string[]
          bowl_template_id?: string
          id?: string
          is_required?: boolean
          position?: number
          slot_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_slots_bowl_template_id_fkey"
            columns: ["bowl_template_id"]
            isOneToOne: false
            referencedRelation: "bowl_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      translations_en: {
        Row: {
          entity_id: string | null
          entity_type: string | null
          field: string | null
          value: string | null
        }
        Insert: {
          entity_id?: string | null
          entity_type?: string | null
          field?: string | null
          value?: string | null
        }
        Update: {
          entity_id?: string | null
          entity_type?: string | null
          field?: string | null
          value?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
