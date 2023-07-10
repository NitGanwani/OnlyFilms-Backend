import { Film } from '../entities/film';
import { HttpError } from '../types/http.error';
import { FilmModel } from './film.m.model';
import { FilmRepo } from './film.m.repository';

jest.mock('./film.m.model');

describe('Given the FilmRepo class', () => {
  const mockRepo = new FilmRepo();
  describe('When it is instantiated', () => {
    test('Then the query method should be used', async () => {
      const mockData = [{}] as unknown as Film[];
      const exec = jest.fn().mockResolvedValueOnce(mockData);

      FilmModel.find = jest.fn().mockReturnValueOnce({
        skip: jest.fn().mockReturnValueOnce({
          limit: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValueOnce({
              exec,
            }),
          }),
        }),
      });

      const result = await mockRepo.query();
      expect(FilmModel.find).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('Then the queryById method should be used', async () => {
      const mockFilm = { id: '1', title: 'El diario de Ragno' };
      const mockId = '1';
      const exec = jest.fn().mockResolvedValue(mockFilm);
      FilmModel.findById = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      const result = await mockRepo.queryById(mockId);
      expect(FilmModel.findById).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockFilm);
    });

    test('Then the create method should be used', async () => {
      const mockFilm = {
        id: '1',
        title: 'Interstellar',
        release: '2014',
        genre: 'Sci-Fi',
        synopsis: 'Best movie ever',
        poster: {},
        owner: {},
      } as unknown as Film;

      (FilmModel.create as jest.Mock).mockReturnValueOnce(mockFilm);
      const result = await mockRepo.create(mockFilm);
      expect(FilmModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockFilm);
    });

    test('Then the update method should be used', async () => {
      const mockId = '7';
      const mockFilm = {
        id: '7',
        title: 'American History X',
      };
      const mockUpdatedFilm = {
        id: '7',
        title: 'Astorga History X',
      };

      const exec = jest.fn().mockResolvedValueOnce(mockUpdatedFilm);
      FilmModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      const result = await mockRepo.update(mockId, mockFilm);
      expect(FilmModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedFilm);
    });

    test('Then the search method should be used', async () => {
      const mockFilm = [{ id: '3', title: 'Marisco and friends' }];

      const exec = jest.fn().mockResolvedValueOnce(mockFilm);
      FilmModel.find = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      const result = await mockRepo.search({
        key: 'title',
        value: 'Marisco and friends',
      });
      expect(FilmModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockFilm);
    });

    test('Then the delete method should be used', async () => {
      const mockId = '2';
      const exec = jest.fn();
      FilmModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });

      await mockRepo.delete(mockId);
      expect(FilmModel.findByIdAndDelete).toHaveBeenCalled();
    });

    test('Then the count method should be used', async () => {
      const mockGenre = 'Comedy';

      const queryObj = {} as any;
      const exec = jest.fn().mockResolvedValueOnce(3);

      FilmModel.countDocuments = jest.fn().mockReturnValue(queryObj);
      queryObj.exec = exec;

      const result = await mockRepo.count(mockGenre);

      expect(exec).toHaveBeenCalled();
      expect(result).toBe(3);
    });

    test('Then the queryById method should throw an error when the id is not found', async () => {
      const error = new HttpError(404, 'Not found', 'Wrong id for the query');
      const mockId = '6';

      const exec = jest.fn().mockResolvedValueOnce(null);
      FilmModel.findById = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec,
        }),
      });

      await expect(mockRepo.queryById(mockId)).rejects.toThrowError(error);
      expect(FilmModel.findById).toHaveBeenCalled();
    });

    test('Then the update method should throw an error when the new user equals to null', async () => {
      const error = new HttpError(404, 'Not found', 'Wrong id for the update');
      const mockId = '4';
      const mockFilm = {} as Partial<Film>;

      const exec = jest.fn().mockResolvedValueOnce(null);
      FilmModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec,
        }),
      });

      await expect(mockRepo.update(mockId, mockFilm)).rejects.toThrowError(
        error
      );
      expect(FilmModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    test('Then the delete method should throw an error when the id is not found', async () => {
      const error = new HttpError(404, 'Not found', 'Wrong id for the delete');
      const mockId = '8';

      const exec = jest.fn().mockResolvedValueOnce(null);
      FilmModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });

      await expect(mockRepo.delete(mockId)).rejects.toThrowError(error);
      expect(FilmModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('When the query method is used', () => {
    test('Then it should return all the films with "Drama" genre', async () => {
      const mockGenre = 'Drama';

      const queryObj = {} as any;
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnThis();
      const populate = jest.fn().mockReturnThis();
      const exec = jest.fn().mockResolvedValueOnce([]);

      FilmModel.find = jest.fn().mockReturnValue(queryObj);
      queryObj.skip = skip;
      queryObj.limit = limit;
      queryObj.populate = populate;
      queryObj.exec = exec;

      await mockRepo.query(1, 6, mockGenre);

      expect(skip).toHaveBeenCalled();
      expect(limit).toHaveBeenCalled();
      expect(populate).toHaveBeenCalledWith('owner');
      expect(exec).toHaveBeenCalled();
    });
  });
});
