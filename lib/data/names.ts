// Name pools for procedural squad generation. Each nation maps to a cultural
// pool. Not real rosters — plausible, locale-flavoured names.

export interface NamePool {
  first: string[];
  last: string[];
  /** mononym style (Brazil) — use a single name from `first` */
  mono?: boolean;
}

const POOLS: Record<string, NamePool> = {
  iberian: {
    first: ["Álvaro", "Sergio", "Pablo", "Marco", "Diego", "Carlos", "Javier", "Mikel", "Dani", "Iker", "Rodri", "Pau", "Nico", "Fermín", "Aitor", "Unai", "Bryan", "Gavi", "Adrián", "Hugo", "Lucas", "Marc", "Joselu", "Ferran"],
    last: ["García", "Fernández", "Rodríguez", "Martínez", "López", "Sánchez", "Torres", "Ramos", "Olmo", "Merino", "Williams", "Cubarsí", "Le Normand", "Zubimendi", "Oyarzabal", "Morata", "Carvajal", "Laporte", "Asensio", "Ruiz", "Soler", "Navas", "Vivian", "Baena"],
  },
  portuguese: {
    first: ["João", "Bruno", "Bernardo", "Rúben", "Diogo", "Gonçalo", "Vitinha", "Nuno", "Rafael", "Pedro", "André", "Francisco", "Tiago", "Nélson", "António", "Matheus", "Renato", "Otávio", "Geovany", "Hugo", "Fábio", "José", "Domingos", "Beto"],
    last: ["Silva", "Fernandes", "Dias", "Cancelo", "Leão", "Ramos", "Neves", "Mendes", "Félix", "Costa", "Palhinha", "Inácio", "Veiga", "Conceição", "Trincão", "Nunes", "Semedo", "Pereira", "Sousa", "Carvalho", "Pinto", "Tavares", "Moreira", "Quenda"],
  },
  brazil: {
    first: ["Rodrygo", "Vinícius", "Endrick", "Raphinha", "Bruno", "Lucas", "Gabriel", "Éder", "Wendell", "Casemiro", "Marquinhos", "Danilo", "Alisson", "Bremer", "Savinho", "Andreas", "João", "Estêvão", "Igor", "Beraldo", "Murillo", "Vanderson", "Hugo", "Yan", "Antony", "Pedro", "Richarlison", "Joelinton", "Matheus", "Fabrício", "Caio", "Wesley", "Luiz", "Léo", "Douglas"],
    last: [],
    mono: true,
  },
  english: {
    first: ["Harry", "Jude", "Phil", "Bukayo", "Declan", "Marcus", "Cole", "Jordan", "Kyle", "John", "Trent", "Ezri", "Levi", "Anthony", "Ollie", "Morgan", "Noni", "Jarrod", "Reece", "Conor", "James", "Eberechi", "Adam", "Curtis"],
    last: ["Kane", "Bellingham", "Foden", "Saka", "Rice", "Rashford", "Palmer", "Henderson", "Walker", "Stones", "Watkins", "Gordon", "Colwill", "Konsa", "Mainoo", "Gibbs-White", "Madueke", "Bowen", "James", "Gallagher", "Maddison", "Eze", "Wharton", "Jones"],
  },
  french: {
    first: ["Kylian", "Aurélien", "Ousmane", "Antoine", "William", "Eduardo", "Bradley", "Theo", "Jules", "Ibrahima", "Adrien", "Randal", "Marcus", "Warren", "Manu", "Mike", "Lucas", "Dayot", "Michael", "Jean-Philippe", "Christopher", "Youssouf", "Khéphren", "Désiré"],
    last: ["Mbappé", "Tchouaméni", "Dembélé", "Griezmann", "Saliba", "Camavinga", "Barcola", "Hernández", "Koundé", "Konaté", "Rabiot", "Kolo Muani", "Thuram", "Zaïre-Emery", "Koné", "Maignan", "Digne", "Upamecano", "Olise", "Mateta", "Nkunku", "Fofana", "Cherki", "Doué"],
  },
  germanic: {
    first: ["Joshua", "Florian", "Jamal", "Kai", "Leroy", "İlkay", "Antonio", "Niclas", "Pascal", "Robert", "Marc-André", "David", "Nico", "Maximilian", "Deniz", "Aleksandar", "Jonathan", "Angelo", "Felix", "Chris", "Benjamin", "Waldemar", "Karim", "Tim"],
    last: ["Kimmich", "Wirtz", "Musiala", "Havertz", "Sané", "Gündoğan", "Rüdiger", "Füllkrug", "Groß", "Andrich", "ter Stegen", "Raum", "Schlotterbeck", "Mittelstädt", "Undav", "Pavlović", "Tah", "Stiller", "Nmecha", "Führich", "Henrichs", "Anton", "Adeyemi", "Kleindienst"],
  },
  dutch: {
    first: ["Virgil", "Frenkie", "Cody", "Memphis", "Denzel", "Nathan", "Tijjani", "Xavi", "Jeremie", "Micky", "Bart", "Jurriën", "Lutsharel", "Wout", "Stefan", "Joey", "Ryan", "Brian", "Donyell", "Quilindschy", "Mats", "Justin", "Ian", "Teun"],
    last: ["van Dijk", "de Jong", "Gakpo", "Depay", "Dumfries", "Aké", "Reijnders", "Simons", "Frimpong", "van de Ven", "Verbruggen", "Timber", "Geertruida", "Weghorst", "de Vrij", "Veerman", "Gravenberch", "Brobbey", "Malen", "Hartman", "Wieffer", "Kluivert", "Maatsen", "Koopmeiners"],
  },
  scandinavian: {
    first: ["Erling", "Martin", "Alexander", "Antonio", "Sander", "Patrick", "Kristian", "Fredrik", "Morten", "Rasmus", "Christian", "Pierre-Emile", "Joakim", "Andreas", "Jonas", "Mikkel", "Victor", "Joachim", "Mohamed", "Albert", "Oscar", "Leo", "Emil", "Anders"],
    last: ["Haaland", "Ødegaard", "Sørloth", "Nusa", "Berge", "Berg", "Thorstvedt", "Aursnes", "Hjulmand", "Højlund", "Eriksen", "Højbjerg", "Mæhle", "Christensen", "Wind", "Damsgaard", "Kristiansen", "Andersen", "Kudus", "Grønbæk", "Bobb", "Østigård", "Ryerson", "Schmeichel"],
  },
  slavic: {
    first: ["Luka", "Mateo", "Joško", "Josip", "Andrej", "Ivan", "Marko", "Mario", "Dominik", "Borna", "Aleksandar", "Dušan", "Sergej", "Filip", "Nikola", "Andriy", "Oleksandr", "Mykhailo", "Illia", "Heorhiy", "Roman", "Bohdan", "Artem", "Viktor"],
    last: ["Modrić", "Kovačić", "Gvardiol", "Šutalo", "Kramarić", "Perišić", "Pašalić", "Pjaca", "Livaković", "Sosa", "Mitrović", "Vlahović", "Milinković-Savić", "Kostić", "Jović", "Yarmolenko", "Zinchenko", "Mudryk", "Zabarnyi", "Sudakov", "Yaremchuk", "Mykolenko", "Dovbyk", "Tsygankov"],
  },
  arabic: {
    first: ["Achraf", "Sofyan", "Yassine", "Hakim", "Noussair", "Azzedine", "Brahim", "Mohammed", "Salem", "Sami", "Mohamed", "Riyad", "Youcef", "Ramy", "Ismaël", "Aymen", "Bilal", "Houssem", "Ali", "Hassan", "Tarek", "Karim", "Walid", "Anis"],
    last: ["Hakimi", "Amrabat", "Bounou", "Ziyech", "Mazraoui", "Ounahi", "Díaz", "Kudus", "Al-Dawsari", "Maouassa", "Salah", "Mahrez", "Atal", "Bensebaini", "Bennacer", "Aouar", "El Khannouss", "Aouar", "Maaloul", "Msakni", "Skhiri", "Hamed", "Cheddira", "Saïd"],
  },
  african_en: {
    first: ["Victor", "Ademola", "Alex", "Samuel", "Wilfred", "Calvin", "Ola", "Mohammed", "Thomas", "Iñaki", "Jordan", "Kamaldeen", "Mohammed", "Franck", "Sébastien", "Simon", "Serge", "Evan", "Ibrahim", "Amad", "Terem", "Bright", "Joe", "Tariq"],
    last: ["Osimhen", "Lookman", "Iwobi", "Chukwueze", "Ndidi", "Bassey", "Aina", "Kudus", "Partey", "Williams", "Ayew", "Sulemana", "Salisu", "Kessié", "Haller", "Adingra", "Aurier", "Ndicka", "Sangaré", "Diallo", "Moffi", "Osayi-Samuel", "Aribo", "Lamptey"],
  },
  japanese: {
    first: ["Takefusa", "Wataru", "Kaoru", "Daichi", "Ritsu", "Takehiro", "Ko", "Junya", "Hidemasa", "Ayase", "Reo", "Takumi", "Shogo", "Kyogo", "Daizen", "Hiroki", "Yukinari", "Keito", "Zion", "Mao", "Yuki", "Koki", "Ao", "Seiya"],
    last: ["Kubo", "Endo", "Mitoma", "Kamada", "Doan", "Tomiyasu", "Itakura", "Ito", "Morita", "Ueda", "Hatate", "Minamino", "Taniguchi", "Furuhashi", "Maeda", "Sakai", "Sugawara", "Nakamura", "Suzuki", "Hosoya", "Soma", "Machida", "Tanaka", "Hashioka"],
  },
  korean: {
    first: ["Heung-min", "Min-jae", "Hwang", "Lee", "Kim", "Hwang", "Cho", "Jung", "Kwon", "Hong", "Seol", "Bae", "Oh", "Park", "Na", "Yang", "Joo", "Um", "Hwang", "Kim", "Jeong", "Son", "Lee", "Kim"],
    last: ["Son", "Kim", "Hee-chan", "Kang-in", "Min-jae", "In-beom", "Gue-sung", "Woo-young", "Kyung-won", "Hyun-jun", "Young-woo", "Jun-ho", "Hyeon-gyu", "Ji-soo", "Sang-ho", "Tae-hwan", "Min-kyu", "Ji-sung", "Ui-jo", "Seung-ho", "Woo-yeong", "Tae-yong", "Jae-sung", "Moon-hwan"],
  },
  persian: {
    first: ["Mehdi", "Sardar", "Alireza", "Mehdi", "Saeid", "Ramin", "Majid", "Ahmad", "Karim", "Saman", "Shoja", "Hossein", "Omid", "Milad", "Reza", "Vahid", "Morteza", "Ali", "Amir", "Allahyar", "Mohammad", "Saeed", "Ehsan", "Aref"],
    last: ["Taremi", "Azmoun", "Jahanbakhsh", "Ghoddos", "Ezatolahi", "Rezaeian", "Hosseini", "Noorollahi", "Ansarifard", "Gholizadeh", "Khalilzadeh", "Hosseini", "Ebrahimi", "Mohammadi", "Cheshmi", "Amiri", "Pouraliganji", "Karimi", "Abedzadeh", "Sayyadmanesh", "Mohebi", "Ezatollahi", "Hajsafi", "Aghasi"],
  },
  turkish: {
    first: ["Arda", "Hakan", "Kenan", "Kaan", "Ferdi", "Orkun", "Yusuf", "Barış", "Mert", "Çağlar", "Zeki", "İrfan", "Kerem", "Cengiz", "Salih", "Abdülkerim", "Samet", "Yunus", "Okay", "Eren", "Semih", "Altay", "Uğurcan", "Berkan"],
    last: ["Güler", "Çalhanoğlu", "Yıldız", "Ayhan", "Kadıoğlu", "Kökçü", "Yazıcı", "Yılmaz", "Müldür", "Söyüncü", "Çelik", "Can", "Akgün", "Ünder", "Özcan", "Bardakcı", "Akaydın", "Kalın", "Yokuşlu", "Dervişoğlu", "Kılınç", "Bayındır", "Çakır", "Demir"],
  },
  latam: {
    first: ["Lionel", "Lautaro", "Julián", "Enzo", "Alexis", "Rodrigo", "Cristian", "Nicolás", "Giovani", "Marcos", "Nahuel", "Exequiel", "Leandro", "James", "Luis", "Jhon", "Richard", "Federico", "Darwin", "Ronald", "Hirving", "Edson", "Santiago", "César", "Moisés", "Pervis", "Gustavo", "Miguel", "Wilmar", "Andrés"],
    last: ["Messi", "Martínez", "Álvarez", "Fernández", "Mac Allister", "De Paul", "Romero", "Otamendi", "Lo Celso", "Acuña", "Molina", "Palacios", "Paredes", "Rodríguez", "Díaz", "Córdoba", "Suárez", "Valverde", "Núñez", "Araújo", "Lozano", "Álvarez", "Giménez", "Montes", "Caicedo", "Estupiñán", "Cuéllar", "Almirón", "Barrios", "Sánchez"],
  },
  central_asian: {
    first: ["Eldor", "Abbosbek", "Jaloliddin", "Otabek", "Khojimat", "Abduqodir", "Igor", "Oston", "Sherzod", "Jasurbek", "Rustam", "Azizbek", "Dostonbek", "Ulugbek", "Husniddin", "Farrukh", "Sardor", "Bobir", "Diyor", "Aziz", "Odil", "Javokhir", "Sanjar", "Temurbek"],
    last: ["Shomurodov", "Faizullaev", "Masharipov", "Yusupov", "Erkinov", "Khusanov", "Sergeev", "Urunov", "Nasrullaev", "Khamraliev", "Ashurmatov", "Turgunboev", "Khamdamov", "Rashidov", "Norchaev", "Sayfiev", "Saidov", "Abdixolikov", "Imamnazarov", "Abdullaev", "Akhmedov", "Boltaboev", "Tursunov", "Yaxshiboev"],
  },
  anglo_na: {
    first: ["Christian", "Weston", "Tyler", "Yunus", "Gio", "Antonee", "Tim", "Folarin", "Sergiño", "Matt", "Ricardo", "Alphonso", "Jonathan", "Tajon", "Stephen", "Cyle", "Ismael", "Jacob", "Michael", "Maxime", "Demarai", "Leon", "Cavan", "Brandon"],
    last: ["Pulisic", "McKennie", "Adams", "Musah", "Reyna", "Robinson", "Weah", "Balogun", "Dest", "Turner", "Pepi", "Davies", "David", "Buchanan", "Eustáquio", "Larin", "Koné", "Shaffelburg", "Miller", "Crépeau", "Gray", "Bailey", "Sullivan", "Aaronson"],
  },
};

// country (team code) → pool key
const COUNTRY_POOL: Record<string, keyof typeof POOLS> = {
  ESP: "iberian", POR: "portuguese", BRA: "brazil",
  ENG: "english", FRA: "french",
  GER: "germanic", AUT: "germanic", SUI: "germanic",
  NED: "dutch", BEL: "dutch",
  NOR: "scandinavian", DEN: "scandinavian",
  CRO: "slavic", SRB: "slavic", UKR: "slavic",
  MAR: "arabic", EGY: "arabic", ALG: "arabic", TUN: "arabic", KSA: "arabic", QAT: "arabic", IRQ: "arabic", JOR: "arabic", SEN: "arabic",
  NGA: "african_en", GHA: "african_en", CMR: "african_en", CIV: "african_en", CPV: "portuguese",
  JPN: "japanese", KOR: "korean", IRN: "persian", TUR: "turkish",
  ARG: "latam", URU: "latam", COL: "latam", ECU: "latam", PAR: "latam", MEX: "latam", CRC: "latam", PAN: "latam",
  UZB: "central_asian",
  USA: "anglo_na", CAN: "anglo_na", JAM: "anglo_na", AUS: "anglo_na", NZL: "anglo_na",
};

export function poolFor(teamCode: string): NamePool {
  return POOLS[COUNTRY_POOL[teamCode] ?? "english"];
}
