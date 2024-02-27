import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}
  
  async executeSeed() {

    await this.pokemonModel.deleteMany({}); //esta linea es como un delete * from Pokemons

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    const pokemonToInsert: {name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {

      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2];

      pokemonToInsert.push({ name, no }); // [{name: bulbasaur, no: 1}]

    });

    await this.pokemonModel.insertMany(pokemonToInsert); //esta linea es como un insert into pokemons(name, no)

    return 'seed executed';

    
    //OTRA FORMA DE INSERTAR EN LA BASE DE DATOS (MENOS EFICIENTE)
    
    // const insertPromiseArray = [];

    // data.results.forEach(({ name, url }) => {

    //   const segments = url.split('/');
    //   const no: number = +segments[ segments.length - 2];

    //   //const pokemon = await this.pokemonModel.create({ name, no });
    //   insertPromiseArray.push(
    //     this.pokemonModel.create({ name, no })
    //   );

    // });

    // await Promise.all( insertPromiseArray );

    // return 'seed executed';
  }
}
