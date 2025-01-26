$(() => {
    const API_ENDPOINT = "https://api.api-ninjas.com/v1/animals";
    const API_KEY = 'rKuvMS3wLClLBgTfE8yetQ==7WVJSStPArBxXthT'; // Replace with your API Ninjas key
    
    const loadRecentSearches = () => {
        const recentSearches = JSON.parse(localStorage.getItem('recentAnimals')) || [];
        const $recentList = $('#recent-list');
        $recentList.empty();
        
        recentSearches.forEach(animal => {
            const $searchItem = $('<div>')
                .addClass('recent-search-item')
                .text(animal)
                .click(() => {
                    $('#animal-name').val(animal);
                    searchAnimal(animal);
                });
            $recentList.append($searchItem);
        });
    };

    const saveSearch = (animalName) => {
        const recentSearches = JSON.parse(localStorage.getItem('recentAnimals')) || [];
        const filteredSearches = recentSearches.filter(name => name !== animalName);
        
        filteredSearches.unshift(animalName);
        if (filteredSearches.length > 5) {
            filteredSearches.pop();
        }
        
        localStorage.setItem('recentAnimals', JSON.stringify(filteredSearches));
        loadRecentSearches();
    };
    
    const displayAnimalData = (animals) => {
        const $results = $('#animal-results');
        $results.empty();
        
        animals.forEach(animal => {
            const $animalCard = $('<div>').addClass('animal-card');
            
            $animalCard.append(`
                <h3>${animal.name}</h3>
                <p><strong>Scientific Name:</strong> ${animal.taxonomy.scientific_name || 'Unknown'}</p>
            `);

            if (animal.characteristics) {
                const $characteristicsSection = $('<div>').addClass('characteristics-section');
                $characteristicsSection.append('<div class="characteristic-title">Characteristics:</div>');

                Object.entries(animal.characteristics).forEach(([key, value]) => {
                    if (value && value !== '') {
                        const formattedKey = key.split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        $characteristicsSection.append(`
                            <div class="animal-characteristic">
                                <strong>${formattedKey}:</strong> ${value}
                            </div>
                        `);
                    }
                });
                $animalCard.append($characteristicsSection);
            }

            const additionalInfo = [
                { title: 'Locations', items: animal.locations || [] },
                { title: 'Prey', items: animal.prey ? animal.prey.split(',').map(item => item.trim()) : [] },
                { title: 'Predators', items: animal.predators ? animal.predators.split(',').map(item => item.trim()) : [] },
                { title: 'Diet', items: [animal.diet].filter(item => item && item !== '') }
            ];

            additionalInfo.forEach(section => {
                if (section.items && section.items.length > 0) {
                    $animalCard.append(`
                        <div class="characteristic-title">${section.title}:</div>
                        <div>
                            ${section.items.map(item => `
                                <span class="animal-characteristic">${item}</span>
                            `).join('')}
                        </div>
                    `);
                }
            });
            
            $results.append($animalCard);
        });
    };
    
    const searchAnimal = async (animalName) => {
        $('#loading').show();
        $('#error-message').hide();
        
        try {
            const response = await fetch(`${API_ENDPOINT}?name=${animalName}`, {
                headers: {
                    'X-Api-Key': API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                $('#error-message')
                    .text('No animals found matching your search')
                    .show();
                $('#animal-results').empty();
                return;
            }
            
            console.log('Animal data:', data[0]);
            
            displayAnimalData(data);
            saveSearch(animalName.toLowerCase());
            
        } catch (error) {
            $('#errors-message')
                .text(`Error: ${error.message}`)
                .show();
            $('#animal-results').empty();
        } finally {
            $('#loading').hide();
        }
    };
    
    $('#search-button').on('click', () => {
        const animalName = $('#animal-name').val().trim();
        
        if (!animalName) {
            $('#error-message')
                .text('Please enter an real animal name')
                .show();
            return;
        }
        
        searchAnimal(animalName);
    });
    
    $('#load-recent').on('click', loadRecentSearches);
        loadRecentSearches();
});