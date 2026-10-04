import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'


const SHARDS = [
  [ {id: 5008, icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png', name: 'Adaptive Force', shortDesc: '+9 Adaptive Force'},
    {id: 5005, icon: 'perk-images/StatMods/StatModsAttackSpeedIcon.png', name: 'Attack Speed', shortDesc: '+10% Attack Speed'},
    {id: 5007, icon: 'perk-images/StatMods/StatModsCDRScalingIcon.png', name: 'Ability Haste', shortDesc: '+8 Ability Haste'} ],
  [ {id: 5008, icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png', name: 'Adaptive Force', shortDesc: '+9 Adaptive Force'},
    {id: 5010, icon: 'perk-images/StatMods/StatModsMovementSpeedIcon.png', name: 'Move Speed', shortDesc: '+2% Move Speed'},
    {id: 5001, icon: 'perk-images/StatMods/StatModsHealthScalingIcon.png', name: 'Scaling Health', shortDesc: '+10-180 Health (based on level)'} ],
  [ {id: 5011, icon: 'perk-images/StatMods/StatModsHealthPlusIcon.png', name: 'Flat Health', shortDesc: '+65 Health'},
    {id: 5013, icon: 'perk-images/StatMods/StatModsTenacityIcon.png', name: 'Tenacity', shortDesc: '+10% Tenacity and Slow Resist'},
    {id: 5001, icon: 'perk-images/StatMods/StatModsHealthScalingIcon.png', name: 'Scaling Health', shortDesc: '+10-180 Health (based on level)'} ]
];

const STAT_NAMES = {
  FlatPhysicalDamageMod: "Attack Damage",
  FlatHPPoolMod: "Health",
  FlatMagicDamageMod: "Ability Power",
  FlatMovementSpeedMod: "Movement Speed",
  PercentMovementSpeedMod: "Movement Speed %",
  PercentAttackSpeedMod: "Attack Speed %",
  FlatArmorMod: "Armor",
  AbilityHaste: "Ability Haste",
  Lethality: "Lethality",
  MagicPenetration: "Magic Penetration",
  BaseManaRegen: "Base Mana Regen %",
  BaseHealthRegen: "Base Health Regen %",
  PercentLifeStealMod: "Life Steal %",
  Tenacity: "Tenacity",
  PercentArmorPenetrationMod: "Armor Penetration %",
  FlatMagicPenetrationMod: "Magic Penetration",
  PercentMagicPenetrationMod: "Magic Penetration %",
  Omnivamp: "Omnivamp %",
  HealAndShieldPower: "Heal and Shield Power %",
  GoldPer10: "Gold per 10s",
  FlatMagicDamageMod: "Ability Power",
  FlatPhysicalDamageMod: "Attack Damage",
  FlatHPPoolMod: "Health",
  FlatMPPoolMod: "Mana",
  FlatSpellBlockMod: "Magic Resist",
  FlatMovementSpeedMod: "Movement Speed",

  FlatSpellBlockMod: "Magic Resist",
  FlatCritChanceMod: "Critical Strike",
  FlatMPPoolMod: "Mana"
};

function App() {
  const [items, setItems] = useState([])
  const [champions, setChampions] = useState([])
  const [selectedChamp, setSelectedChamp] = useState(null)
  const [champSearchQuery, setChampSearchQuery] = useState('')
  const [champCategory, setChampCategory] = useState('All')
  const [champLevel, setChampLevel] = useState(1)

  const filteredChamps = champions.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(champSearchQuery.toLowerCase())
    const matchesCategory = champCategory === 'All' || c.tags.includes(champCategory)
    return matchesSearch && matchesCategory
  })
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState('calculator')
  const [champion, setChampion] = useState('Zed')
  const [inventory, setInventory] = useState([null, null, null, null, null, null])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRuneModalOpen, setIsRuneModalOpen] = useState(false)
  const [runeData, setRuneData] = useState([])
  const [primaryRunePath, setPrimaryRunePath] = useState(null)
  const [secondaryRunePath, setSecondaryRunePath] = useState(null)
  const [primaryRunes, setPrimaryRunes] = useState({})
  const [secondaryRunes, setSecondaryRunes] = useState({})
  const [shardRunes, setShardRunes] = useState({0: null, 1: null, 2: null})
  const [hoveredRune, setHoveredRune] = useState(null)

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [savedBuilds, setSavedBuilds] = useState([])
  const [newBuildName, setNewBuildName] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem('lol_builds')
    if (stored) setSavedBuilds(JSON.parse(stored))
  }, [])

  const resetBuild = () => {
    setInventory([null, null, null, null, null, null])
    setChampLevel(1)
    setPrimaryRunePath(null)
    setSecondaryRunePath(null)
    setPrimaryRunes({})
    setSecondaryRunes({})
    setShardRunes({0: null, 1: null, 2: null})
  }

  const saveCurrentBuild = (overwriteId = null) => {
    const buildData = {
      id: overwriteId || Date.now().toString(),
      name: overwriteId ? savedBuilds.find(b => b.id === overwriteId).name : (newBuildName || "Untitled Build"),
      champion,
      champLevel,
      inventory,
      primaryRunePath,
      secondaryRunePath,
      primaryRunes,
      secondaryRunes,
      shardRunes
    }

    let updated;
    if (overwriteId) {
       updated = savedBuilds.map(b => b.id === overwriteId ? buildData : b);
    } else {
       updated = [...savedBuilds, buildData];
    }
    setSavedBuilds(updated);
    localStorage.setItem('lol_builds', JSON.stringify(updated));
    setNewBuildName("");
  }

  const loadBuild = (build) => {
    setChampion(build.champion || "Zed");
    setChampLevel(build.champLevel || 1);
    setInventory(build.inventory || [null, null, null, null, null, null]);
    setPrimaryRunePath(build.primaryRunePath || null);
    setSecondaryRunePath(build.secondaryRunePath || null);
    setPrimaryRunes(build.primaryRunes || {});
    setSecondaryRunes(build.secondaryRunes || {});
    setShardRunes(build.shardRunes || {0: null, 1: null, 2: null});
    setIsSaveModalOpen(false);
  }

  const deleteBuild = (id) => {
    const updated = savedBuilds.filter(b => b.id !== id);
    setSavedBuilds(updated);
    localStorage.setItem('lol_builds', JSON.stringify(updated));
  }

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    axios.get('http://localhost:8000/api/items/')
      .then(response => {
        // Filter out items that are unpurchaseable to keep the shop clean
        const validItems = response.data.filter(item => item.total_cost > 0)
        setItems(validItems)
        
      // Fetch Runes directly from Data Dragon
      axios.get('https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/runesReforged.json').then(runeRes => {
        setRuneData(runeRes.data)
        setPrimaryRunePath(runeRes.data[0]) // Default to Domination
      })
      
      axios.get('http://localhost:8000/api/champions/').then(champRes => {
          setChampions(champRes.data)
          setLoading(false)
        })
      })
      .catch(error => {
        console.error("Error fetching items:", error)
        setLoading(false)
      })
  }, [])

  const addToInventory = (item) => {
    const emptyIndex = inventory.findIndex(slot => slot === null)
    if (emptyIndex !== -1) {
      const newInv = [...inventory]
      newInv[emptyIndex] = item
      setInventory(newInv)
      setIsModalOpen(false)
    }
  }

  const removeFromInventory = (index) => {
    const newInv = [...inventory]
    newInv[index] = null
    setInventory(newInv)
  }

  const calculateStatAtLevel = (base, perLevel, level) => {
    if (!perLevel) return base || 0;
    return base + perLevel * (level - 1) * (0.7025 + 0.0175 * (level - 1));
  }

  const calculateTotalStats = () => {
    const totals = {}
    let totalCost = 0
    
    // 1. Champion Base Stats
    const selectedChampData = champions.find(c => c.name === champion)
    if (selectedChampData && selectedChampData.stats) {
       const s = selectedChampData.stats;
       totals.FlatHPPoolMod = calculateStatAtLevel(s.hp, s.hpperlevel, champLevel);
       totals.FlatMPPoolMod = calculateStatAtLevel(s.mp, s.mpperlevel, champLevel);
       totals.FlatPhysicalDamageMod = calculateStatAtLevel(s.attackdamage, s.attackdamageperlevel, champLevel);
       totals.FlatArmorMod = calculateStatAtLevel(s.armor, s.armorperlevel, champLevel);
       totals.FlatSpellBlockMod = calculateStatAtLevel(s.spellblock, s.spellblockperlevel, champLevel);
       totals.FlatMovementSpeedMod = s.movespeed;
       totals.PercentAttackSpeedMod = calculateStatAtLevel(0, s.attackspeedperlevel / 100, champLevel);
    }

    // 2. Item Stats
    inventory.forEach(item => {
      if (item) {
        totalCost += item.total_cost
        if (item.stats) {
          Object.entries(item.stats).forEach(([key, value]) => {
            totals[key] = (totals[key] || 0) + value
          })
        }
      }
    })

    // 3. Shard Stats
    Object.values(shardRunes).forEach(shardId => {
       if (!shardId) return;
       if (shardId === 5008) { // Adaptive
         totals.FlatPhysicalDamageMod = (totals.FlatPhysicalDamageMod || 0) + 5.4;
         totals.FlatMagicDamageMod = (totals.FlatMagicDamageMod || 0) + 9;
       }
       if (shardId === 5005) totals.PercentAttackSpeedMod = (totals.PercentAttackSpeedMod || 0) + 0.10;
       if (shardId === 5007) totals.AbilityHaste = (totals.AbilityHaste || 0) + 8;
       if (shardId === 5010) totals.PercentMovementSpeedMod = (totals.PercentMovementSpeedMod || 0) + 0.02;
       if (shardId === 5001) totals.FlatHPPoolMod = (totals.FlatHPPoolMod || 0) + (10 + (170 / 17) * (champLevel - 1));
       if (shardId === 5011) totals.FlatHPPoolMod = (totals.FlatHPPoolMod || 0) + 65;
       if (shardId === 5013) totals.Tenacity = (totals.Tenacity || 0) + 0.10;
    })

    // Rounding for clean UI
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 100) / 100;
    })

    return { totals, totalCost }
  }

  
  const togglePrimaryRune = (slotIndex, runeId) => {
    setPrimaryRunes(prev => ({ ...prev, [slotIndex]: runeId }))
  }
  const toggleSecondaryRune = (slotIndex, runeId) => {
    setSecondaryRunes(prev => {
      const next = { ...prev }
      if (next[slotIndex] === runeId) {
        delete next[slotIndex]
      } else {
        next[slotIndex] = runeId
        const keys = Object.keys(next)
        if (keys.length > 2) {
          const oldest = keys.find(k => k !== String(slotIndex))
          delete next[oldest]
        }
      }
      return next
    })
  }
  const toggleShard = (rowIdx, shardId) => {
    setShardRunes(prev => ({ ...prev, [rowIdx]: shardId }))
  }

  const { totals, totalCost } = calculateTotalStats()
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) return <div className="loading-screen">Summoning the Void...</div>

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>The Howling Abyss</h2>
        </div>
        <nav>
          <button 
            className={activeTab === 'item_list' ? 'active' : ''} 
            onClick={() => setActiveTab('item_list')}
          >
            Item Vault
          </button>
          <button 
            className={activeTab === 'champions' ? 'active' : ''} 
            onClick={() => setActiveTab('champions')}
          >
            Champions
          </button>
          <button 
            className={activeTab === 'calculator' ? 'active' : ''} 
            onClick={() => setActiveTab('calculator')}
          >
            Build Calculator
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'calculator' ? (
          <div className="calculator-view">
            <header className="calc-header">
              <div className="champ-select">
                <label>Champion Vessel:</label>
                <select value={champion} onChange={e => setChampion(e.target.value)}>
                  {champions.length === 0 ? <option>Loading...</option> : champions.map(c => (
                    <option key={c.id_name} value={c.name}>{c.name} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="level-slider">
                <label>Level {champLevel}</label>
                <input 
                  type="range" 
                  min="1" max="18" 
                  value={champLevel} 
                  onChange={e => setChampLevel(parseInt(e.target.value))} 
                />
              </div>
              <button className="rune-btn" onClick={() => setIsRuneModalOpen(true)}>
                Configure Runes
              </button>
            </header>

            <div className="inventory-section">
              <h3>Equipment Grid</h3>
              <div className="inventory-grid">
                {inventory.map((item, index) => (
                  <div 
                    key={index} 
                    className={`inventory-slot ${item ? 'filled' : 'empty'}`}
                    onClick={() => item ? removeFromInventory(index) : setIsModalOpen(true)}
                  >
                    {item ? (
                      <div className="slot-content">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image_file}`} alt={item.name} className="equipped-item-img" title={item.name} />
                        <span className="remove-tooltip">Remove</span>
                      </div>
            
        ) : activeTab === 'champions' ? (
          <div className="champions-view">
            <h2>The Roster of Runeterra ({filteredChamps.length})</h2>
            <div className="champ-filters">
              <input 
                type="text" 
                placeholder="Search champions..." 
                value={champSearchQuery} 
                onChange={e => setChampSearchQuery(e.target.value)} 
                className="search-bar"
                style={{ margin: 0, flex: 1 }}
              />
              <select 
                value={champCategory} 
                onChange={e => setChampCategory(e.target.value)} 
                className="role-select"
              >
                <option value="All">All Roles</option>
                <option value="Assassin">Assassin</option>
                <option value="Fighter">Fighter</option>
                <option value="Mage">Mage</option>
                <option value="Marksman">Marksman</option>
                <option value="Support">Support</option>
                <option value="Tank">Tank</option>
              </select>
            </div>
            <div className="champ-grid">
              {filteredChamps.map(champ => (
                <div key={champ.id} className="champ-card" onClick={() => setSelectedChamp(champ)}>
                  <div className="champ-image-wrapper">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id_name}_0.jpg`} alt={champ.name} />
                  </div>
                  <div className="champ-info">
                    <h3>{champ.name}</h3>
                    <p className="champ-title">{champ.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedChamp && (
              <div className="modal-overlay" onClick={() => setSelectedChamp(null)}>
                <div className="modal-content champ-detail-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedChamp.name} - {selectedChamp.title}</h3>
                    <button className="close-btn" onClick={() => setSelectedChamp(null)}>X</button>
                  </div>
                  <div className="champ-detail-body">
                    <div className="champ-detail-sidebar">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${selectedChamp.id_name}_0.jpg`} alt={selectedChamp.name} className="champ-full-art" />
                      <div className="champ-base-stats">
                        <h4>Base Stats</h4>
                        <p>HP: {selectedChamp.stats.hp} (+{selectedChamp.stats.hpperlevel})</p>
                        <p>AD: {selectedChamp.stats.attackdamage} (+{selectedChamp.stats.attackdamageperlevel})</p>
                        <p>Armor: {selectedChamp.stats.armor} (+{selectedChamp.stats.armorperlevel})</p>
                        <p>MR: {selectedChamp.stats.spellblock} (+{selectedChamp.stats.spellblockperlevel})</p>
                      </div>
                    </div>
                    <div className="champ-detail-main">
                      <p className="champ-lore">{selectedChamp.lore}</p>
                      
                      <div className="champ-skills">
                        <h4>Spells & Abilities</h4>
                        <div className="skill-card">
                           <strong>Passive: {selectedChamp.passive.name}</strong>
                           <p dangerouslySetInnerHTML={{__html: selectedChamp.passive.description}}></p>
                        </div>
                        {selectedChamp.spells.map((spell, idx) => (
                           <div key={idx} className="skill-card">
                             <strong>{['Q','W','E','R'][idx]}: {spell.name}</strong>
                             <p dangerouslySetInnerHTML={{__html: spell.description}}></p>
                           </div>
                        ))}
                      </div>

                      <div className="champ-runes">
                        <h4>Recommended Runes (The Seer's Whisper)</h4>
                        <p className="text-muted">Runes for {selectedChamp.name} are dynamically shifting. The Watchers recommend Domination or Precision based on common mortal tactics.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
                      <span className="add-icon">+</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="bottom-action-bar">
                <button 
                  className="add-item-main-btn calc-submit-btn" 
                  onClick={() => {
                     const el = document.getElementById('stat-output');
                     if(el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Submit / Calculate Power
                </button>
                <div className="build-action-btns">
                  <button className="save-btn" onClick={() => setIsSaveModalOpen(true)}>Save / Load</button>
                  <button className="reset-btn" onClick={resetBuild}>Reset</button>
                </div>
              </div>
            </div>

            <div className="stats-section" id="stat-output">
              <h3>Stat Output Overall</h3>
              <div className="stats-grid">
                <div className="stat-card total-gold">
                  <span className="stat-label">Total Gold Spent</span>
                  <span className="stat-value">{totalCost}g</span>
                </div>
                {Object.keys(totals).length === 0 ? (
                  <p className="no-stats">No items equipped. Your vessel is weak.</p>
        
        ) : activeTab === 'champions' ? (
          <div className="champions-view">
            <h2>The Roster of Runeterra ({filteredChamps.length})</h2>
            <div className="champ-filters">
              <input 
                type="text" 
                placeholder="Search champions..." 
                value={champSearchQuery} 
                onChange={e => setChampSearchQuery(e.target.value)} 
                className="search-bar"
                style={{ margin: 0, flex: 1 }}
              />
              <select 
                value={champCategory} 
                onChange={e => setChampCategory(e.target.value)} 
                className="role-select"
              >
                <option value="All">All Roles</option>
                <option value="Assassin">Assassin</option>
                <option value="Fighter">Fighter</option>
                <option value="Mage">Mage</option>
                <option value="Marksman">Marksman</option>
                <option value="Support">Support</option>
                <option value="Tank">Tank</option>
              </select>
            </div>
            <div className="champ-grid">
              {filteredChamps.map(champ => (
                <div key={champ.id} className="champ-card" onClick={() => setSelectedChamp(champ)}>
                  <div className="champ-image-wrapper">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id_name}_0.jpg`} alt={champ.name} />
                  </div>
                  <div className="champ-info">
                    <h3>{champ.name}</h3>
                    <p className="champ-title">{champ.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedChamp && (
              <div className="modal-overlay" onClick={() => setSelectedChamp(null)}>
                <div className="modal-content champ-detail-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedChamp.name} - {selectedChamp.title}</h3>
                    <button className="close-btn" onClick={() => setSelectedChamp(null)}>X</button>
                  </div>
                  <div className="champ-detail-body">
                    <div className="champ-detail-sidebar">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${selectedChamp.id_name}_0.jpg`} alt={selectedChamp.name} className="champ-full-art" />
                      <div className="champ-base-stats">
                        <h4>Base Stats</h4>
                        <p>HP: {selectedChamp.stats.hp} (+{selectedChamp.stats.hpperlevel})</p>
                        <p>AD: {selectedChamp.stats.attackdamage} (+{selectedChamp.stats.attackdamageperlevel})</p>
                        <p>Armor: {selectedChamp.stats.armor} (+{selectedChamp.stats.armorperlevel})</p>
                        <p>MR: {selectedChamp.stats.spellblock} (+{selectedChamp.stats.spellblockperlevel})</p>
                      </div>
                    </div>
                    <div className="champ-detail-main">
                      <p className="champ-lore">{selectedChamp.lore}</p>
                      
                      <div className="champ-skills">
                        <h4>Spells & Abilities</h4>
                        <div className="skill-card">
                           <strong>Passive: {selectedChamp.passive.name}</strong>
                           <p dangerouslySetInnerHTML={{__html: selectedChamp.passive.description}}></p>
                        </div>
                        {selectedChamp.spells.map((spell, idx) => (
                           <div key={idx} className="skill-card">
                             <strong>{['Q','W','E','R'][idx]}: {spell.name}</strong>
                             <p dangerouslySetInnerHTML={{__html: spell.description}}></p>
                           </div>
                        ))}
                      </div>

                      <div className="champ-runes">
                        <h4>Recommended Runes (The Seer's Whisper)</h4>
                        <p className="text-muted">Runes for {selectedChamp.name} are dynamically shifting. The Watchers recommend Domination or Precision based on common mortal tactics.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
                  Object.entries(totals).map(([stat, value]) => (
                    <div className="stat-card" key={stat}>
                      <span className="stat-label">{STAT_NAMES[stat] || stat}</span>
                      <span className="stat-value">
                        {stat.includes('Percent') || stat.includes('Crit') ? `${(value * 100).toFixed(0)}%` : value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            
            {/* Save/Load Configuration Modal */}
            {isSaveModalOpen && (
              <div className="modal-overlay" onClick={() => setIsSaveModalOpen(false)}>
                <div className="modal-content save-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>The Vault of Memories</h3>
                    <button className="close-btn" onClick={() => setIsSaveModalOpen(false)}>X</button>
                  </div>
                  <div className="save-modal-body">
                    <div className="new-save-bar">
                      <input 
                        type="text" 
                        placeholder="Name your creation..." 
                        value={newBuildName} 
                        onChange={e => setNewBuildName(e.target.value)} 
                      />
                      <button className="save-new-btn" onClick={() => saveCurrentBuild()}>Save New</button>
                    </div>
                    <div className="saved-builds-list">
                      {savedBuilds.length === 0 ? <p className="placeholder">No memories forged yet.</p> : savedBuilds.map(b => (
                        <div key={b.id} className="saved-build-card">
                          <div className="build-info">
                             <h4>{b.name}</h4>
                             <span>{b.champion} (Lv. {b.champLevel})</span>
                          </div>
                          <div className="build-actions-mini">
                             <button className="action-btn load-btn" onClick={() => loadBuild(b)}>Load</button>
                             <button className="action-btn overwrite-btn" onClick={() => saveCurrentBuild(b.id)}>Overwrite</button>
                             <button className="action-btn delete-btn" onClick={() => deleteBuild(b.id)}>X</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rune Configuration Modal */}
            {isRuneModalOpen && (
              <div className="modal-overlay" onClick={() => setIsRuneModalOpen(false)}>
                <div className="modal-content rune-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>The Seer's Runes</h3>
                    <button className="close-btn" onClick={() => setIsRuneModalOpen(false)}>X</button>
                  </div>
                  
                  <div className="rune-modal-body">
                    <div className="dual-rune-layout">
                      
                      {/* PRIMARY COLUMN */}
                      <div className="rune-column primary-column">
                        <h4>Primary Path</h4>
                        <div className="path-icons">
                          {runeData.map(path => (
                            <div 
                              key={path.id} 
                              className={`path-icon ${primaryRunePath?.id === path.id ? 'active' : ''}`}
                              onClick={() => { 
                                setPrimaryRunePath(path); 
                                setPrimaryRunes({});
                                if (secondaryRunePath?.id === path.id) {
                                  setSecondaryRunePath(null);
                                  setSecondaryRunes({});
                                }
                              }}
                            >
                              <img src={`https://ddragon.leagueoflegends.com/cdn/img/${path.icon}`} alt={path.name} title={path.name} />
                            </div>
                          ))}
                        </div>
                        
                        {primaryRunePath && (
                          <div className="rune-tree">
                            {primaryRunePath.slots.map((slot, sIdx) => (
                              <div key={sIdx} className="rune-row">
                                {slot.runes.map(rune => (
                                  <div 
                                    key={rune.id} 
                                    className={`rune-icon ${primaryRunes[sIdx] === rune.id ? 'selected' : primaryRunes[sIdx] ? 'dimmed' : ''} ${sIdx === 0 ? 'keystone' : ''}`}
                                    onClick={() => togglePrimaryRune(sIdx, rune.id)}
                                    onMouseEnter={() => setHoveredRune(rune)}
                                    onMouseLeave={() => setHoveredRune(null)}
                                  >
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt={rune.name} />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SECONDARY COLUMN */}
                      <div className="rune-column secondary-column">
                        <h4>Secondary Path</h4>
                        <div className="path-icons">
                          {runeData.filter(p => p.id !== primaryRunePath?.id).map(path => (
                            <div 
                              key={path.id} 
                              className={`path-icon ${secondaryRunePath?.id === path.id ? 'active' : ''}`}
                              onClick={() => { setSecondaryRunePath(path); setSecondaryRunes({}); }}
                            >
                              <img src={`https://ddragon.leagueoflegends.com/cdn/img/${path.icon}`} alt={path.name} title={path.name} />
                            </div>
                          ))}
                        </div>

                        {secondaryRunePath && (
                          <div className="rune-tree">
                            {/* Skip Keystones (index 0) for secondary */}
                            {secondaryRunePath.slots.slice(1).map((slot, rawIdx) => {
                              const sIdx = rawIdx + 1; // Map back to true slot index
                              return (
                                <div key={sIdx} className="rune-row">
                                  {slot.runes.map(rune => (
                                    <div 
                                      key={rune.id} 
                                      className={`rune-icon ${secondaryRunes[sIdx] === rune.id ? 'selected' : (Object.keys(secondaryRunes).length >= 2 && !secondaryRunes[sIdx]) ? 'dimmed' : ''}`}
                                      onClick={() => toggleSecondaryRune(sIdx, rune.id)}
                                      onMouseEnter={() => setHoveredRune(rune)}
                                      onMouseLeave={() => setHoveredRune(null)}
                                    >
                                      <img src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt={rune.name} />
                                    </div>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        <h4>Stat Shards</h4>
                        <div className="rune-tree shards-tree">
                          {SHARDS.map((row, rIdx) => (
                            <div key={rIdx} className="rune-row">
                              {row.map((shard, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className={`rune-icon shard-icon ${shardRunes[rIdx] === shard.id ? 'selected' : shardRunes[rIdx] ? 'dimmed' : ''}`}
                                  onClick={() => toggleShard(rIdx, shard.id)}
                                  onMouseEnter={() => setHoveredRune(shard)}
                                  onMouseLeave={() => setHoveredRune(null)}
                                >
                                  <img src={`https://ddragon.leagueoflegends.com/cdn/img/${shard.icon}`} alt={shard.name} />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>

                    <div className="rune-desc-panel">
                      {hoveredRune ? (
                        <>
                          <h4>{hoveredRune.name}</h4>
                          <p dangerouslySetInnerHTML={{__html: hoveredRune.shortDesc}}></p>
                        </>
                      ) : (
                        <p className="placeholder">Hover over a rune or shard to reveal its secrets.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Item Selection Modal */}

            {isModalOpen && (
              <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>The Black Market</h3>
                    <button className="close-btn" onClick={() => setIsModalOpen(false)}>X</button>
                  </div>
                  <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search artifacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="item-picker-grid">
                    {filteredItems.map(item => (
                      <div key={item.id} className="picker-card" onClick={() => addToInventory(item)}>
                        <img src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image_file}`} alt={item.name} />
                        <h4>{item.name}</h4>
                        <p className="gold-cost">{item.total_cost}g</p>
                        <div className="item-picker-desc" dangerouslySetInnerHTML={{__html: item.description}}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : activeTab === 'champions' ? (
          <div className="champions-view">
            <h2>The Roster of Runeterra ({filteredChamps.length})</h2>
            <div className="champ-filters">
              <input 
                type="text" 
                placeholder="Search champions..." 
                value={champSearchQuery} 
                onChange={e => setChampSearchQuery(e.target.value)} 
                className="search-bar"
                style={{ margin: 0, flex: 1 }}
              />
              <select 
                value={champCategory} 
                onChange={e => setChampCategory(e.target.value)} 
                className="role-select"
              >
                <option value="All">All Roles</option>
                <option value="Assassin">Assassin</option>
                <option value="Fighter">Fighter</option>
                <option value="Mage">Mage</option>
                <option value="Marksman">Marksman</option>
                <option value="Support">Support</option>
                <option value="Tank">Tank</option>
              </select>
            </div>
            <div className="champ-grid">
              {filteredChamps.map(champ => (
                <div key={champ.id} className="champ-card" onClick={() => setSelectedChamp(champ)}>
                  <div className="champ-image-wrapper">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id_name}_0.jpg`} alt={champ.name} />
                  </div>
                  <div className="champ-info">
                    <h3>{champ.name}</h3>
                    <p className="champ-title">{champ.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedChamp && (
              <div className="modal-overlay" onClick={() => setSelectedChamp(null)}>
                <div className="modal-content champ-detail-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedChamp.name} - {selectedChamp.title}</h3>
                    <button className="close-btn" onClick={() => setSelectedChamp(null)}>X</button>
                  </div>
                  <div className="champ-detail-body">
                    <div className="champ-detail-sidebar">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${selectedChamp.id_name}_0.jpg`} alt={selectedChamp.name} className="champ-full-art" />
                      <div className="champ-base-stats">
                        <h4>Base Stats</h4>
                        <p>HP: {selectedChamp.stats.hp} (+{selectedChamp.stats.hpperlevel})</p>
                        <p>AD: {selectedChamp.stats.attackdamage} (+{selectedChamp.stats.attackdamageperlevel})</p>
                        <p>Armor: {selectedChamp.stats.armor} (+{selectedChamp.stats.armorperlevel})</p>
                        <p>MR: {selectedChamp.stats.spellblock} (+{selectedChamp.stats.spellblockperlevel})</p>
                      </div>
                    </div>
                    <div className="champ-detail-main">
                      <p className="champ-lore">{selectedChamp.lore}</p>
                      
                      <div className="champ-skills">
                        <h4>Spells & Abilities</h4>
                        <div className="skill-card">
                           <strong>Passive: {selectedChamp.passive.name}</strong>
                           <p dangerouslySetInnerHTML={{__html: selectedChamp.passive.description}}></p>
                        </div>
                        {selectedChamp.spells.map((spell, idx) => (
                           <div key={idx} className="skill-card">
                             <strong>{['Q','W','E','R'][idx]}: {spell.name}</strong>
                             <p dangerouslySetInnerHTML={{__html: spell.description}}></p>
                           </div>
                        ))}
                      </div>

                      <div className="champ-runes">
                        <h4>Recommended Runes (The Seer's Whisper)</h4>
                        <p className="text-muted">Runes for {selectedChamp.name} are dynamically shifting. The Watchers recommend Domination or Precision based on common mortal tactics.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="item-list-view">
            <h2>The Vault of Artifacts ({items.length})</h2>
            <div className="full-item-grid">
              {items.map(item => (
                <div key={item.id} className="full-item-card">
                  <div className="full-item-header">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image_file}`} alt={item.name} />
                    <h3>{item.name}</h3>
                  </div>
                  <p className="cost">{item.total_cost}g</p>
                  <div className="item-description-html" dangerouslySetInnerHTML={{__html: item.description}}></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
