document.addEventListener("DOMContentLoaded", () => {
  const superheroSearchBar = document.getElementById("superhero-search-bar");
  const superheroResultsDiv = document.getElementById("superhero-results");
  const favoriteHeroesListDiv = document.getElementById("favorite-heroes-list");

  // Event listener for the search bar input
  if (superheroSearchBar) {
    superheroSearchBar.addEventListener("input", () => {
      const searchQuery = superheroSearchBar.value;
      searchSuperheroes(searchQuery);
    });
  }

  // Render favorite heroes on page load
  if (favoriteHeroesListDiv) {
    renderFavoriteHeroes();
  }

  // Function to search superheroes using Marvel API
  async function searchSuperheroes(query) {
    const timestamp = Date.now();
    const marvelPublicKey = "6389c4f63dc6fffb901020124594d390";
    const marvelPrivateKey = "7483fbb743fa429119142a2f6bdc4f41ede1d23b";
    const apiHash = CryptoJS.MD5(timestamp + marvelPrivateKey + marvelPublicKey).toString();

    try {
      // Fetch superheroes based on the search query
      const response = await fetch(
        `https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=${query}&ts=${timestamp}&apikey=${marvelPublicKey}&hash=${apiHash}`
      );
      const data = await response.json();
      showSuperheroes(data.data.results);
    } catch (error) {
      console.error("Error fetching superheroes:", error);
    }
  }

  // Function to display the list of superheroes
  function showSuperheroes(superheroes) {
    superheroResultsDiv.innerHTML = "";
    superheroes.forEach((hero) => {
      const heroElement = document.createElement("div");
      heroElement.innerHTML = `
        <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}">
        <h2>${hero.name}</h2>
        <button onclick="addHeroToFavorites('${hero.id}', '${hero.name}', '${hero.thumbnail.path}.${hero.thumbnail.extension}')">Add to Favorites</button>
        <a href="hero-details.html?id=${hero.id}">More Info</a>
      `;
      superheroResultsDiv.appendChild(heroElement);
    });
  }

  // Function to render favorite heroes from localStorage
  function renderFavoriteHeroes() {
    let favoriteHeroes = JSON.parse(localStorage.getItem("favoriteHeroes")) || [];
    favoriteHeroesListDiv.innerHTML = "";
    favoriteHeroes.forEach((hero) => {
      const heroElement = document.createElement("div");
      heroElement.innerHTML = `
        <a href="hero-details.html?id=${hero.id}">
          <img src="${hero.thumbnail}" alt="${hero.name}">
        </a>
        <h2>${hero.name}</h2>
        <button onclick="removeHeroFromFavorites('${hero.id}')">Remove from Favorites</button>
      `;
      favoriteHeroesListDiv.appendChild(heroElement);
    });
  }

  // Add hero to favorites and store in localStorage
  window.addHeroToFavorites = function (id, name, thumbnail) {
    let favoriteHeroes = JSON.parse(localStorage.getItem("favoriteHeroes")) || [];
    if (!favoriteHeroes.some((hero) => hero.id === id)) {
      favoriteHeroes.push({ id, name, thumbnail });
      localStorage.setItem("favoriteHeroes", JSON.stringify(favoriteHeroes));
    }
  };

  // Remove hero from favorites and update localStorage
  window.removeHeroFromFavorites = function (id) {
    let favoriteHeroes = JSON.parse(localStorage.getItem("favoriteHeroes")) || [];
    favoriteHeroes = favoriteHeroes.filter((hero) => hero.id !== id);
    localStorage.setItem("favoriteHeroes", JSON.stringify(favoriteHeroes));
    renderFavoriteHeroes();
  };
});

document.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const heroId = queryParams.get("id");

  // Fetch and display hero details if an ID is provided in the URL
  if (heroId) {
    await getHeroDetails(heroId);
  }

  // Function to get hero details from the Marvel API
  async function getHeroDetails(id) {
    const timestamp = Date.now();
    const marvelPublicKey = "6389c4f63dc6fffb901020124594d390";
    const marvelPrivateKey = "7483fbb743fa429119142a2f6bdc4f41ede1d23b";
    const apiHash = CryptoJS.MD5(timestamp + marvelPrivateKey + marvelPublicKey).toString();

    try {
      // Fetch hero details based on the hero ID
      const response = await fetch(
        `https://gateway.marvel.com:443/v1/public/characters/${id}?ts=${timestamp}&apikey=${marvelPublicKey}&hash=${apiHash}`
      );
      const data = await response.json();
      showHeroDetails(data.data.results[0]);
    } catch (error) {
      console.error("Error fetching superhero details:", error);
    }
  }

  // Function to display the hero details
  function showHeroDetails(hero) {
    const heroDetailsDiv = document.getElementById("hero-details");
    heroDetailsDiv.innerHTML = `
      <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}">
      <h2>${hero.name}</h2>
      <p>${hero.description}</p>
      <h3>Comics</h3>
      <ul>${hero.comics.items.map((item) => `<li>${item.name}</li>`).join("")}</ul>
      <h3>Series</h3>
      <ul>${hero.series.items.map((item) => `<li>${item.name}</li>`).join("")}</ul>
      <h3>Stories</h3>
      <ul>${hero.stories.items.map((item) => `<li>${item.name}</li>`).join("")}</ul>
    `;
  }
});
