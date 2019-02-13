const equipment = {
    modifier: [
        broken = {
            name: 'Broken',
            bonus: -1,
			level_modifier: -5,
            rarity: 100
        },
        damaged = {
            name: 'Damaged',
			level_modifier: -4,
            bonus: -0.5,
            rarity: 100
        },
        chipped = {
            name: 'Chipped',
			level_modifier: -3,
            bonus: -0.25,
            rarity: 100
        },
        inferior = {
            name: 'Inferior',
			level_modifier: -2,
            bonus: 0,
            rarity: 100
        },
        sturdy = {
            name: 'Sturdy',
			level_modifier: -1,
            bonus: 0.25,
            rarity: 80
        },
        hardened = {
            name: 'Hardened',
			level_modifier: 0,
            bonus: 0.5,
            rarity: 70
        },
        simple = {
            name: 'Simple',
			level_modifier: 0,
            bonus: 0.75,
            rarity: 60
        },
        common = {
            name: 'Common',
			level_modifier: 0,
            bonus: 1,
            rarity: 50
        },
        large = {
            name: 'Large',
			level_modifier: 0,
            bonus: 1.25,
            rarity: 40
        },
        savage = {
            name: 'Savage',
			level_modifier: 0,
            bonus: 1.5,
            rarity: 30
        },
        reinforced = {
            name: 'Reinforced',
			level_modifier: 0,
            bonus: 1.75,
            rarity: 25
        },
        tempered = {
            name: 'Tempered',
			level_modifier: 1,
            bonus: 2,
            rarity: 20
        },
        ruthless = {
            name: 'Ruthless',
			level_modifier: 2,
            bonus: 2.25,
            rarity: 15
        },
        demonic = {
            name: 'Demonic',
			level_modifier: 3,
            bonus: 2.5,
            rarity: 10
        },
        menacing = {
            name: 'Menacing',
			level_modifier: 4,
            bonus: 2.75,
            rarity: 5
        },
        godly = {
            name: 'Godly',
			level_modifier: 5,
            bonus: 3,
            rarity: 4
        },
        demonic = {
            name: 'Demonic',
			level_modifier: 6,
            bonus: 3.25,
            rarity: 3
        },
        mythical = {
            name: 'Mythical',
			level_modifier: 7,
            bonus: 3.5,
            rarity: 2,
        },
        legendary = {
            name: 'Legendary',
			level_modifier: 8,
            bonus: 4,
            rarity: 1
        }
    ],

    material: [
        wood = {
            name: 'Cardboard',
			level_modifier: -5,
            bonus: 0,
            rarity: 100
        },
        bone = {
            name: 'Bone',
			level_modifier: -4,
            bonus: 0.125,
            rarity: 100
        },
        leatherbound = {
            name: 'Leatherbound',
			level_modifier: -3,
            bonus: 0.25,
            rarity: 100
        },
        stone = {
            name: 'Stone',
			level_modifier: -2,
            bonus: 0.5,
            rarity: 90
        },
        copper = {
            name: 'Copper',
			level_modifier: -1,
            bonus: 0.75,
            rarity: 80
        },
        iron = {
            name: 'Iron',
			level_modifier: 0,
            bonus: 1,
            rarity: 70
        },
        steel = {
            name: 'Steel',
			level_modifier: 0,
            bonus: 1.25,
            rarity: 60
        },
        silver = {
            name: 'Silver',
			level_modifier: 0,
            bonus: 1.5,
            rarity: 50
        },
        gold = {
            name: 'Gold',
			level_modifier: 0,
            bonus: 1.75,
            rarity: 40
        },
        crystal = {
            name: 'Crystal',
			level_modifier: 1,
            bonus: 2,
            rarity: 30
        },
        titanium = {
            name: 'Titanium',
			level_modifier: 2,
            bonus: 2.25,
            rarity: 25
        },
        mythril = {
            name: 'Mythril',
			level_modifier: 3,
            bonus: 2.5,
            rarity: 20
        },
        adamantite = {
            name: 'Adamantite',
			level_modifier: 4,
            bonus: 2.75,
            rarity: 15
        },
        astral = {
            name: 'Astral',
			level_modifier: 5,
            bonus: 3,
            rarity: 10
        },
        cosmic = {
            name: 'Cosmic',
			level_modifier: 6,
            bonus: 3.25,
            rarity: 5
        },
        chaotic = {
            name: 'Chaotic',
			level_modifier: 7,
            bonus: 3.5,
            rarity: 3
        },
        nightmare = {
            name: 'Nightmare',
			level_modifier: 8,
            bonus: 3.75,
            rarity: 2
        },
        holy = {
            name: 'Holy',
			level_modifier: 9,
            bonus: 4,
            rarity: 1
        }
    ],

    type: [
        weapon = [
            dagger = {
                name: 'Dagger',
                type: 'weapon',
                prowess: 0.25,
                agility: 3
            },
            rapier = {
                name: 'Rapier',
                type: 'weapon',
                prowess: 0.5,
                agility: 2
            },
            shortsword = {
                name: 'Shortsword',
                type: 'weapon',
                prowess: 0.75,
                agility: 1
            },
            longsword = {
                name: 'Longsword',
                type: 'weapon',
                prowess: 1
            },
            cutlass = {
                name: 'Cutlass',
                type: 'weapon',
                prowess: 1
            },
            falchion = {
                name: 'Falchion',
                type: 'weapon',
                prowess: 1
            },
            scimitar = {
                name: 'Scimitar',
                type: 'weapon',
                prowess: 1
            },
            estoc = {
                name: 'Estoc',
                type: 'weapon',
                prowess: 1
            },
            bardiche = {
                name: 'Bardiche',
                type: 'weapon',
                prowess: 1.25,
                agility: -1
            },
            battle_axe = {
                name: 'Battle Axe',
                type: 'weapon',
                prowess: 1.5,
                agility: -2
            },
            zweihander = {
                name: 'Zweihander',
                type: 'weapon',
                prowess: 1.75,
                agility: -3
            },
            quarterstaff = {
                name: 'Quarterstaff',
                type: 'weapon',
                prowess: 1,
                arcana: 1,
                vitality: 1
            },
            bullwhip = {
                name: 'Bullwhip',
                type: 'weapon',
                prowess: 1
            },
            chain_whip = {
                name: 'Chain Whip',
                type: 'weapon',
                prowess: 1
            },
            katana = {
                name: 'Katana',
                type: 'weapon',
                prowess: 1,
                agility: 2
            },
            halberd = {
                name: 'Halberd',
                type: 'weapon',
                prowess: 2,
                agility: -2
            }
        ],

        shield = [
            buckler = {
                name: 'Buckler',
                type: 'shield',
                rarity: 100,
                fortitude: 0.25
            },
            small_shield = {
                name: 'Small Shield',
                type: 'shield',
                rarity: 80,
                fortitude: 0.5
            },
            large_shield = {
                name: 'Large Shield',
                type: 'shield',
                rarity: 60,
                fortitude: 0.75
            },
            kite_shield = {
                name: 'Kite Shield',
                type: 'shield',
                rarity: 40,
                fortitude: 1
            },
            spiked_shield = {
                name: 'Spiked Shield',
                type: 'shield',
                fortitude: 1.25,
                rarity: 20,
                prowess: 0.5
            },
            tower_shield = {
                name: 'Tower Shield',
                type: 'shield',
                rarity: 15,
                fortitude: 1.5
            },
            barbed_shield = {
                name: 'Barbed Shield',
                type: 'shield',
                rarity: 10,
                fortitude: 1.75,
                prowess: 1
            },
            pavise = {
                name: 'Pavise',
                type: 'shield',
                rarity: 5,
                fortitude: 2
            },
            aegis = {
                name: 'Aegis',
                type: 'shield',
                rarity: 1,
                fortitude: 2.5,
                prowess: 1.5
            },
        ],

        helm = [
            cap = {
                name: 'Cap',
                type: 'helm',
                rarity: 100,
                fortitude: 0.25
            },
            skull_cap = {
                name: 'Skull Cap',
                type: 'helm',
                rarity: 100,
                fortitude: 0.5
            },
            helm = {
                name: 'Helm',
                type: 'helm',
                rarity: 90,
                fortitude: 0.75
            },
            full_helm = {
                name: 'Full Helm',
                type: 'helm',
                rarity: 80,
                fortitude: 1
            },
            demon_mask = {
                name: 'Demon Mask',
                type: 'helm',
                rarity: 70,
                fortitude: 1.25
            },
            horned_helm = {
                name: 'Horned Helm',
                type: 'helm',
                rarity: 60,
                fortitude: 1.5
            },
            great_helm = {
                name: 'Great Helm',
                type: 'helm',
                rarity: 50,
                fortitude: 1.75
            },
            crown = {
                name: 'Crown',
                type: 'helm',
                rarity: 30,
                fortitude: 2
            },
            war_hat = {
                name: 'War Hat',
                type: 'helm',
                rarity: 20,
                fortitude: 2.25
            },
            sallet = {
                name: 'Sallet',
                type: 'helm',
                rarity: 15,
                fortitude: 2.5
            },
            casque = {
                name: 'Casque',
                type: 'helm',
                rarity: 10,
                fortitude: 2.75
            },
            basinet = {
                name: 'Basinet',
                type: 'helm',
                rarity: 5,
                fortitude: 3
            },
            winged_helm = {
                name: 'Winged Helm',
                type: 'helm',
                rarity: 4,
                fortitude: 3.25
            },
            grand_crown = {
                name: 'Grand Crown',
                type: 'helm',
                rarity: 3,
                fortitude: 3.5
            },
            spired_helm = {
                name: 'Spired Helm',
                type: 'helm',
                rarity: 2,
                fortitude: 3.75
            },
            accursed_visage = {
                name: 'Accursed Visage',
                type: 'helm',
                rarity: 1,
                fortitude: 4
            }
        ],

        chest = [
            shirt = {
                name: 'Shirt',
                type: 'chest',
                fortitude: 0,
                rarity: 100,
                agility: 4
            },
            padded_chest = {
                name: 'Padded chest',
                type: 'chest',
                fortitude: 0.25,
                rarity: 90,
                agility: 3
            },
            studded_chest = {
                name: 'Studded chest',
                type: 'chest',
                fortitude: 0.5,
                rarity: 80,
                agility: 2
            },
            ring_mail = {
                name: 'Ring Mail',
                type: 'chest',
                fortitude: 0.75,
                rarity: 70,
                agility: 1
            },
            scale_mail = {
                name: 'Scale Mail',
                type: 'chest',
                fortitude: 1,
                rarity: 60
            },
            chainmail = {
                name: 'Chainmail',
                type: 'chest',
                fortitude: 1.25,
                rarity: 50
            },
            light_plate = {
                name: 'Light Plate',
                type: 'chest',
                fortitude: 1.5,
                rarity: 30
            },
            heavy_plate = {
                name: 'Heavy Plate',
                type: 'chest',
                fortitude: 1.75,
                rarity: 25
            },
            ornate_chest = {
                name: 'Ornate chest',
                type: 'chest',
                fortitude: 2,
                rarity: 20
            },
            chaos_plate = {
                name: 'Chaos Plate',
                type: 'chest',
                fortitude: 2.25,
                rarity: 15
            },
            ancient_chest = {
                name: 'Ancient chest',
                type: 'chest',
                fortitude: 2.5,
                rarity: 10
            },
            archon_plate = {
                name: 'Archon Plate',
                type: 'chest',
                fortitude: 2.75,
                rarity: 5
            },
            sacred_plate = {
                name: 'Sacred Plate',
                type: 'chest',
                fortitude: 3,
                rarity: 3
            },
            kraken_shell = {
                name: 'Kraken Shell',
                type: 'chest',
                fortitude: 3.5,
                rarity: 2
            },
            shadow_plate = {
                name: 'Shadow Plate',
                type: 'chest',
                fortitude: 4,
                rarity: 1
            }
        ],

        legs = [
            pants = {
                name: 'Pants',
                type: 'legs',
                fortitude: 0.25,
                rarity: 100,
                agility: 3
            },
            leggings = {
                name: 'Leggings',
                type: 'legs',
                fortitude: 0.5,
                rarity: 80,
                agility: 2
            },
            breeches = {
                name: 'Breeches',
                type: 'legs',
                fortitude: 0.75,
                rarity: 60,
                agility: 1
            },
            faulds = {
                name: 'Faulds',
                type: 'legs',
                rarity: 40,
                fortitude: 1
            },
            plate_leggings = {
                name: 'Plate Leggings',
                type: 'legs',
                fortitude: 1.25,
                rarity: 20,
                agility: -1
            },
            tassets = {
                name: 'Tassets',
                type: 'legs',
                fortitude: 1.5,
                rarity: 15,
                agility: -2
            },
            cuisses = {
                name: 'Cuisses',
                type: 'legs',
                fortitude: 1.75,
                rarity: 10,
                agility: -3
            }
        ],

        boots = [
            shoes = {
                name: 'Shoes',
                type: 'boots',
                fortitude: 0.25,
                rarity: 100,
                agility: 3
            },
            boots = {
                name: 'Boots',
                type: 'boots',
                fortitude: 0.5,
                rarity: 80,
                agility: 2
            },
            chain_boots = {
                name: 'Chain Boots',
                type: 'boots',
                fortitude: 0.75,
                rarity: 60,
                agility: 1
            },
            light_plated_boots = {
                name: 'Light Plated Boots',
                type: 'boots',
                rarity: 40,
                fortitude: 1
            },
            heavy_plated_boots = {
                name: 'Heavy Plated Boots',
                type: 'boots',
                fortitude: 1.25,
                rarity: 20,
                agility: -1
            },
            greaves = {
                name: 'Greaves',
                type: 'boots',
                fortitude: 1.5,
                rarity: 15,
                agility: -2
            },
            war_boots = {
                name: 'War Boots',
                type: 'boots',
                fortitude: 1.75,
                rarity: 10,
                agility: -3
            },
            mirrored_boots = {
                name: 'Mirrored Boots',
                type: 'boots',
                rarity: 5,
                fortitude: 2,
                agility: -4
            }
        ]
    ]
};

module.exports = equipment;