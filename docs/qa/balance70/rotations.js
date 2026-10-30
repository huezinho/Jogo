// Rotations restricted to the kit available by70. No future rolls are inspected.
const rotations70={
 paladino:[['warrior_warcry','warrior_judgment','warrior_judgment','warrior_shove'],['warrior_judgment','warrior_shove','warrior_second_wind','warrior_judgment']],
 berserker:[['warrior_shove','warrior_stagger','warrior_stagger'],['warrior_stagger','warrior_valhalla','warrior_stagger']],
 samurai:[['warrior_deep_cut','warrior_second_wind','warrior_armor_piercer','warrior_deep_cut'],['warrior_shove','warrior_deep_cut','warrior_swift_strikes']],
 ninja:[['warrior_smoke_bomb','warrior_swift_strikes','warrior_deep_cut'],['warrior_deep_cut','warrior_smoke_bomb','warrior_swift_strikes']],
 mago_incendiario:[['mage_fireball','mage_mana_burst','basic'],['mage_fireball','mage_freeze','mage_mana_burst']],
 mago_frigido:[['mage_fireball','mage_freeze','mage_mana_burst'],['mage_fireball','mage_freeze','mage_freeze']],
 arquimago:[['basic','basic','mage_discharge','mage_mana_burst'],['mage_concentration','basic','basic','mage_mana_burst']],
 corrompido:[['mage_mana_burst','mage_corruption','basic'],['mage_corruption','basic','basic']],
 atirador_arcano:[['archer_headshot','archer_headshot','archer_piercing_shot'],['archer_headshot','archer_arcane_shot','archer_headshot']],
 sniper:[['archer_camouflage','archer_headshot','archer_execute'],['archer_piercing_shot','archer_headshot','archer_execute']],
 espreitador:[['archer_camouflage','archer_surprise'],['archer_camouflage','archer_surprise','archer_trap']],
 guarda_florestal:[['archer_tranquilizer','archer_barrage','archer_barrage'],['archer_trap','archer_barrage','archer_camouflage','archer_barrage']],
 druida_sombrio:[['nature_living_seed','nature_roots','nature_swamp_flower','nature_decay','nature_harvest'],['nature_decay','nature_living_seed','nature_roots','nature_swamp_flower','nature_harvest']],
 avatar_da_natureza:[['nature_true_form','basic','basic','basic','basic','basic'],['nature_true_form','nature_living_seed','nature_roots','nature_swamp_flower','basic']],
 fada_monarca:[['nature_living_seed','nature_roots','nature_ancestral_song','nature_queen_decree'],['nature_living_seed','nature_ancestral_song','nature_roots','nature_ancestral_song','nature_queen_decree']],
 protetor_da_floresta:[['nature_living_seed','nature_vine_cocoon','nature_breeze_charm','nature_ancestral_song','nature_breeze_charm'],['nature_ancestral_song','nature_roots','nature_breeze_charm','nature_ancestral_song','nature_breeze_charm']]
};
for(const[id,chains]of Object.entries(rotations70)){ClassLab.alternatives[id]||={};chains.forEach((chain,i)=>ClassLab.alternatives[id]['nivel70_'+i]=chain);}
