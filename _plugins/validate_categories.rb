# frozen_string_literal: true

# Plugin zur Validierung von Kategorien in Rezepten
# Prüft, ob alle verwendeten tags in _data/categories.yml definiert sind

module Jekyll
  module ValidateCategories
    class Generator < Jekyll::Generator
      priority :highest

      def generate(site)
        # Lade gültige Kategorien aus _data/categories.yml
        valid_categories = site.data['categories'] || []
        
        if valid_categories.empty?
          Jekyll.logger.warn "Validate Categories:", "Keine Kategorien in _data/categories.yml gefunden"
          return
        end

        # Prüfe alle Rezepte
        recipes = site.collections['recipes']&.docs || []
        invalid_found = false

        recipes.each do |recipe|
          recipe_tags = recipe.data['tags'] || []
          
          # Überspringe, wenn keine tags vorhanden sind
          next if recipe_tags.empty?

          # Finde ungültige Kategorien
          invalid_tags = recipe_tags - valid_categories

          if invalid_tags.any?
            invalid_found = true
            Jekyll.logger.error "Validate Categories:", "Ungültige Kategorien in #{recipe.relative_path}:"
            invalid_tags.each do |tag|
              Jekyll.logger.error "", "  - '#{tag}'"
            end
            Jekyll.logger.info "", "Erlaubte Kategorien sind:"
            valid_categories.each do |cat|
              Jekyll.logger.info "", "  - #{cat}"
            end
          end
        end

        # Build abbrechen, wenn ungültige Kategorien gefunden wurden
        if invalid_found
          raise "Build abgebrochen: Ungültige Kategorien gefunden. Bitte korrigieren Sie die Rezepte."
        else
          Jekyll.logger.info "Validate Categories:", "✓ Alle #{recipes.length} Rezepte verwenden gültige Kategorien"
        end
      end
    end
  end
end
