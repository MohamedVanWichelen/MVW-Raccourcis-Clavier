        // User preferences tracking
        let userPreferences = {
            categories: {},
            searches: {},
            clicks: {}
        };

        // Track category clicks
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                userPreferences.categories[category] = (userPreferences.categories[category] || 0) + 1;
                localStorage.setItem('keyboardShortcutsPrefs', JSON.stringify(userPreferences));
            });
        });

        // Track shortcut clicks
        document.querySelectorAll('.shortcut-card').forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('h3').textContent.trim();
                userPreferences.clicks[title] = (userPreferences.clicks[title] || 0) + 1;
                localStorage.setItem('keyboardShortcutsPrefs', JSON.stringify(userPreferences));
            });
        });

        // Load preferences from storage
        if (localStorage.getItem('keyboardShortcutsPrefs')) {
            userPreferences = JSON.parse(localStorage.getItem('keyboardShortcutsPrefs'));
        }

        // Filter functionality
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('active', 'bg-blue-600', 'text-white');
                    b.classList.add('bg-gray-100');
                });
                
                btn.classList.add('active', 'bg-blue-600', 'text-white');
                btn.classList.remove('bg-gray-100');
                
                const category = btn.dataset.category;
                const shortcuts = document.querySelectorAll('.shortcut-card');
                
                shortcuts.forEach(shortcut => {
                    if (category === 'all' || shortcut.dataset.category === category) {
                        shortcut.style.display = 'block';
                    } else {
                        shortcut.style.display = 'none';
                    }
                });
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            searchSuggestions.classList.remove('hidden');
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.add('hidden');
            }
        });

        // Enhanced search algorithm
        function searchShortcuts(query) {
            const terms = query.toLowerCase().split(/\s+/);
            const allCards = document.querySelectorAll('.shortcut-card');
            const results = [];
            
            allCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const category = card.dataset.category;
                const popularity = parseInt(card.querySelector('.progress-fill').style.width) || 0;
                const titleWords = title.split(/\s+/);
                const descWords = description.split(/\s+/);
                
                // Calculate match score
                let score = 0;
                
                // Exact matches
                terms.forEach(term => {
                    if (title.includes(term)) score += 3;
                    if (description.includes(term)) score += 1;
                });
                
                // Partial matches (substrings)
                terms.forEach(term => {
                    titleWords.forEach(word => {
                        if (word.includes(term)) score += 1;
                    });
                    descWords.forEach(word => {
                        if (word.includes(term)) score += 0.5;
                    });
                });
                
                // User preferences boost
                const cardTitle = card.querySelector('h3').textContent.trim();
                if (userPreferences.clicks[cardTitle]) {
                    score += userPreferences.clicks[cardTitle] * 0.5;
                }
                
                if (userPreferences.categories[category]) {
                    score += userPreferences.categories[category] * 0.3;
                }
                
                // Popularity boost
                score += popularity * 0.01;
                
                if (score > 0) {
                    results.push({
                        element: card,
                        score: score
                    });
                }
            });
            
            // Sort by score
            results.sort((a, b) => b.score - a.score);
            
            return results;
        }

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchSuggestions.classList.add('hidden');
                return;
            }
            
            // Track search terms
            userPreferences.searches[query] = (userPreferences.searches[query] || 0) + 1;
            localStorage.setItem('keyboardShortcutsPrefs', JSON.stringify(userPreferences));
            
            const results = searchShortcuts(query);
            
            // Update suggestions
            const suggestionsContainer = searchSuggestions.querySelector('div');
            suggestionsContainer.innerHTML = '';
            
            if (results.length === 0) {
                suggestionsContainer.innerHTML = '<div class="px-4 py-2 text-gray-500">Aucun résultat trouvé</div>';
            } else {
                results.slice(0, 5).forEach(result => {
                    const shortcutTitle = result.element.querySelector('h3').textContent;
                    const shortcutKeys = result.element.querySelector('.bg-gray-100').textContent;
                    
                    const suggestion = document.createElement('div');
                    suggestion.className = 'px-4 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100';
                    suggestion.textContent = `${shortcutTitle} (${shortcutKeys})`;
                    
                    suggestion.addEventListener('click', () => {
                        searchInput.value = shortcutTitle;
                        searchSuggestions.classList.add('hidden');
                        result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        result.element.classList.add('ring-2', 'ring-blue-500', 'animate-pulse');
                        setTimeout(() => {
                            result.element.classList.remove('ring-2', 'ring-blue-500', 'animate-pulse');
                        }, 2000);
                    });
                    
                    suggestionsContainer.appendChild(suggestion);
                });
            }
            
            searchSuggestions.classList.remove('hidden');
        });

        // Make shortcut cards clickable
        document.querySelectorAll('.shortcut-card').forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                console.log(`Selected shortcut: ${title}`);
                // In a real app, you might show a modal with more details
            });
        });

        // Load more shortcuts functionality
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const btnText = document.getElementById('btnText');
        const loadingSpinner = document.getElementById('loadingSpinner');
        let currentCount = 10; // Starting with 10 shortcuts already displayed

        // Sample additional shortcuts data
        const moreShortcuts = [
            {
                id: 11,
                title: "Fermer l'onglet",
                description: "Fermer l'onglet actuel",
                keys: "Ctrl+W",
                category: "navigation",
                popularity: 80
            },
            {
                id: 12,
                title: "Ouvrir l'historique",
                description: "Ouvrir l'historique du navigateur",
                keys: "Ctrl+H",
                category: "navigation",
                popularity: 75
            },
            {
                id: 13,
                title: "Ouvrir les téléchargements",
                description: "Ouvrir la page des téléchargements",
                keys: "Ctrl+J",
                category: "navigation",
                popularity: 70
            },
            {
                id: 14,
                title: "Rechercher dans la page",
                description: "Ouvrir la recherche dans la page actuelle",
                keys: "Ctrl+F",
                category: "navigation",
                popularity: 85
            },
            {
                id: 15,
                title: "Capture d'écran",
                description: "Prendre une capture d'écran",
                keys: "PrtScn",
                category: "systeme",
                popularity: 78
            }
        ];

        loadMoreBtn.addEventListener('click', async () => {
            // Show loading state
            btnText.textContent = "Chargement...";
            loadingSpinner.classList.remove('hidden');
            loadMoreBtn.disabled = true;

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get next 5 shortcuts
            const shortcutsToAdd = moreShortcuts.slice(0, 5);
            
            // Add new shortcuts to the grid
            const grid = document.querySelector('.grid');
            
            shortcutsToAdd.forEach(shortcut => {
                const shortcutCard = document.createElement('div');
                shortcutCard.className = 'bg-white rounded-xl shadow-md overflow-hidden relative shortcut-card transition-all duration-200';
                shortcutCard.dataset.category = shortcut.category;
                
                shortcutCard.innerHTML = `
                    <div class="absolute top-2 right-2 popularity-badge ${getPopularityColor(shortcut.popularity)} text-white">#${shortcut.id}</div>
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="inline-block px-2 py-1 ${getPopularityBgColor(shortcut.popularity)} text-xs font-semibold rounded-full mb-2">${getPopularityText(shortcut.popularity)}</span>
                                <h3 class="text-xl font-bold text-gray-800">${shortcut.title}</h3>
                            </div>
                            <div class="bg-gray-100 px-3 py-2 rounded-lg font-mono text-gray-800">${shortcut.keys}</div>
                        </div>
                        <p class="text-gray-600 mb-4">${shortcut.description}</p>
                        <div class="flex items-center justify-between mt-4">
                            <div class="w-full mr-4">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${shortcut.popularity}%"></div>
                                </div>
                            </div>
                            <span class="text-sm font-medium text-gray-700">${shortcut.popularity}/100</span>
                        </div>
                    </div>
                `;
                
                grid.appendChild(shortcutCard);
            });

            // Update current count and remove loaded shortcuts from array
            currentCount += 5;
            moreShortcuts.splice(0, 5);

            // Reset button state
            btnText.textContent = moreShortcuts.length > 0 ? 
                "Charger plus de raccourcis" : "Tous les raccourcis chargés";
            loadingSpinner.classList.add('hidden');
            loadMoreBtn.disabled = moreShortcuts.length === 0;

            // Disable button if no more shortcuts
            if (moreShortcuts.length === 0) {
                loadMoreBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                loadMoreBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            }
        });

        function getPopularityColor(popularity) {
            if (popularity >= 90) return 'bg-gradient-to-r from-pink-400 to-pink-500';
            if (popularity >= 80) return 'bg-gradient-to-r from-blue-400 to-blue-500';
            return 'bg-gradient-to-r from-purple-300 to-purple-400';
        }

        function getPopularityBgColor(popularity) {
            if (popularity >= 90) return 'bg-pink-100 text-pink-800';
            return 'bg-blue-100 text-blue-800';
        }

        function getPopularityText(popularity) {
            if (popularity >= 90) return 'Très populaire';
            return 'Populaire';
        }