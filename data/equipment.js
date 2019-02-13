const equipment = {
    modifier: [
        broken = {
            name: 'Broken',
            bonus: -1,
            rarity: 100
        },
        damaged = {
            name: 'Damaged',
            bonus: -0.5,
            rarity: 100
        },
        chipped = {
            name: 'Chipped',
            bonus: -0.25,
            rarity: 100
        },
        inferior = {
            name: 'Inferior',
            bonus: 0,
            rarity: 100
        },
        sturdy = {
            name: 'Sturdy',
            bonus: 0.25,
            rarity: 80
        },
        hardened = {
            name: 'Hardened',
            bonus: 0.5,
            rarity: 70
        },
        simple = {
            name: 'Simple',
            bonus: 0.75,
            rarity: 60
        },
        common = {
            name: 'Common',
            bonus: 1,
            rarity: 50
        },
        large = {
            name: 'Large',
            bonus: 1.25,
            rarity: 40
        },
        savage = {
            name: 'Savage',
            bonus: 1.5,
            rarity: 30
        },
        reinforced = {
            name: 'Reinforced',
            bonus: 1.75,
            rarity: 25
        },
        tempered = {
            name: 'Tempered',
            bonus: 2,
            rarity: 20
        },
        ruthless = {
            name: 'Ruthless',
            bonus: 2.25,
            rarity: 15
        },
        demonic = {
            name: 'Demonic',
            bonus: 2.5,
            rarity: 10
        },
        menacing = {
            name: 'Menacing',
            bonus: 2.75,
            rarity: 5
        },
        godly = {
            name: 'Godly',
            bonus: 3,
            rarity: 4
        },
        demonic = {
            name: 'Demonic',
            bonus: 3.25,
            rarity: 3
        },
        mythical = {
            name: 'Mythical',
            bonus: 3.5,
            rarity: 2,
        },
        legendary = {
            name: 'Legendary',
            bonus: 4,
            rarity: 1
        }
    ],

    material: [
        wood = {
            name: 'Cardboard',
            bonus: 0,
            rarity: 100
        },
        bone = {
            name: 'Bone',
            bonus: 0.125,
            rarity: 100
        },
        leatherbound = {
            name: 'Leatherbound',
            bonus: 0.25,
            rarity: 100
        },
        stone = {
            name: 'Stone',
            bonus: 0.5,
            rarity: 90
        },
        copper = {
            name: 'Copper',
            bonus: 0.75,
            rarity: 80
        },
        iron = {
            name: 'Iron',
            bonus: 1,
            rarity: 70
        },
        steel = {
            name: 'Steel',
            bonus: 1.25,
            rarity: 60
        },
        silver = {
            name: 'Silver',
            bonus: 1.5,
            rarity: 50
        },
        gold = {
            name: 'Gold',
            bonus: 1.75,
            rarity: 40
        },
        crystal = {
            name: 'Crystal',
            bonus: 2,
            rarity: 30
        },
        titanium = {
            name: 'Titanium',
            bonus: 2.25,
            rarity: 25
        },
        mythril = {
            name: 'Mythril',
            bonus: 2.5,
            rarity: 20
        },
        adamantite = {
            name: 'Adamantite',
            bonus: 2.75,
            rarity: 15
        },
        astral = {
            name: 'Astral',
            bonus: 3,
            rarity: 10
        },
        cosmic = {
            name: 'Cosmic',
            bonus: 3.25,
            rarity: 5
        },
        chaotic = {
            name: 'Chaotic',
            bonus: 3.5,
            rarity: 3
        },
        nightmare = {
            name: 'Nightmare',
            bonus: 3.75,
            rarity: 2
        },
        holy = {
            name: 'Holy',
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
		
        helm = [
            cap = {
                name: 'Cap',
                type: 'helm',
                fortitude: 0.25
            },
            skull_cap = {
                name: 'Skull Cap',
                type: 'helm',
                fortitude: 0.5
            },
            helm = {
                name: 'Helm',
                type: 'helm',
                fortitude: 0.75
            },
            full_helm = {
                name: 'Full Helm',
                type: 'helm',
                fortitude: 1
            },
            demon_mask = {
                name: 'Demon Mask',
                type: 'helm',
                fortitude: 1.25
            },
            horned_helm = {
                name: 'Horned Helm',
                type: 'helm',
                fortitude: 1.5
            },
            great_helm = {
                name: 'Great Helm',
                type: 'helm',
                fortitude: 1.75
            },
            crown = {
                name: 'Crown',
                type: 'helm',
                fortitude: 2
            },
            war_hat = {
                name: 'War Hat',
                type: 'helm',
                fortitude: 2.25
            },
            sallet = {
                name: 'Sallet',
                type: 'helm',
                fortitude: 2.5
            },
            casque = {
                name: 'Casque',
                type: 'helm',
                fortitude: 2.75
            },
            basinet = {
                name: 'Basinet',
                type: 'helm',
                fortitude: 3
            },
            winged_helm = {
                name: 'Winged Helm',
                type: 'helm',
                fortitude: 3.25
            },
            grand_crown = {
                name: 'Grand Crown',
                type: 'helm',
                fortitude: 3.5
            },
            spired_helm = {
                name: 'Spired Helm',
                type: 'helm',
                fortitude: 3.75
            },
            accursed_visage = {
                name: 'Accursed Visage',
                type: 'helm',
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
            shirt = {
                name: 'Shirt',
                type: 'chest',
                fortitude: 0,
                rarity: 100,
                agility: 4
            },
            padded_chest = {
                name: 'Padded Chest',
                type: 'chest',
                fortitude: 0.25,
                rarity: 90,
                agility: 3
            },
            studded_chest = {
                name: 'Studded Chest',
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
		
		
    ]
};

module.exports = equipment;