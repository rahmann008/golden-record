import pandas as pd
import recordlinkage as rl
import time
import json

# Ignore warnings
import warnings
warnings.filterwarnings('ignore')

from recordlinkage.datasets import load_febrl4
from io import BytesIO


def save_csv():
    census_a, census_b = load_febrl4()
    census_a.to_csv("census_a.csv")
    census_b.to_csv("census_b.csv")
    
def read_csv():
    print(pd.read_csv(r'C:\Users\CHIRAGSHAH\OneDrive - Aspirenxt Pvt Ltd\Documents\Chirag\Golden record extrction\GRE-Flask\census_a.csv').columns)

def gc(first_data, second_data):
    
    census_a, census_b = pd.read_csv(BytesIO(first_data)), pd.read_csv(BytesIO(second_data))
    census_a.set_index(census_a.columns[0], inplace=True, drop=True)
    census_b.set_index(census_b.columns[0], inplace=True, drop=True)

    # Create an indexing object
    indexer = rl.Index()
    
    #print(census_a.columns)
    #print(census_b.columns)

    # Block on state
    indexer.block('state')
    #print("gccc")
    start = time.time()
    # Generate candidate pairs
    pairs = indexer.index(census_a, census_b)
    print("shape of census_a", census_a.shape)
    print("shape of census_b", census_b.shape)
    print("Total index: ",len(pairs))

    # Create a comparing object
    compare = rl.Compare()  

    # Query the exact matches of state
    compare.exact('state', 'state', label='state')
    # Query the exact matches of date of birth
    compare.exact('date_of_birth', 'date_of_birth', label='date_of_birth')
    # Query the exact matches of date of birth
    compare.exact('soc_sec_id', 'soc_sec_id', label='soc_sec_id')
    # Query the exact matches of date of birth
    compare.exact('postcode', 'postcode', label='postcode')
    # Query the fuzzy matches for given name
    compare.string('given_name', 'given_name', threshold=0.75, 
                    method='levenshtein', label='given_name')
    # Query the fuzzy matches for surname
    compare.string('surname', 'surname', threshold=0.75, 
                    method='levenshtein', label='surname')
    # Query the fuzzy matches for address
    compare.string('address_1', 'address_1', threshold=0.75,
                    method='levenshtein', label='address')
                    
    # Compute the matches, this will take a while
    matches = compare.compute(pairs, census_a, census_b)

    # Query matches with score over 4
    full_matches = matches[matches.sum(axis='columns') >= 4]
    #print(full_matches.sample(5))


    duplicates = full_matches.index.get_level_values('rec_id_2')
    
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    print("duplicates")
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    print(duplicates)
    
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    #print("census_b index: ", census_b.index)
    #print("census_b columns: ", census_b.columns)

    census_b_res_index = census_b.reset_index()

    duplicate_data = census_b_res_index[census_b_res_index['rec_id'].isin(duplicates)]
    end = time.time()
    #print("Star: ", start)
    #print("End: ", end)
    #print("Total time: ", end-start)
    print("****************************")
    print("duplicate data")
    print("****************************")
    print(duplicate_data)
    
    unique_b = census_b[~census_b.index.isin(duplicates)]
    print("****************************")
    print(unique_b)
    print("****************************")
    
    print("unique_b size: ", unique_b.shape)
    
    golden_record_db = census_a.append(unique_b)
    #print("****************************")
    #print(golden_record_db)
    
    #golden_record_db.to_csv("golden_record_extraction__1.csv",index=False)
    
    output_json = {"Total number of data in first file: ": census_a.shape[0],
                       "Total number of data in second file: ": census_b.shape[0],
                       "Total number of duplicate values: ": duplicate_data.shape,
                       "Total processing time: ": end-start,
                       "Total number of unqiue values from both files: ": golden_record_db.shape}
                       #"original data": ,
                       #"unqiue data":,
                       #"All records ":,
                       #"Duplicate ids ":,
                       
                       
                       
    print(output_json)
    
    return json.dumps(output_json)
                       
                       
def gc_one_file(data_one):

    hospital_dupes = pd.read_csv(BytesIO(data_one))
    hospital_dupes.set_index(hospital_dupes.columns[0], inplace=True, drop=True)
    
    hospital_dupes.fillna('', inplace=True)
    

    dupe_indexer = rl.Index()
    dupe_indexer.sortedneighbourhood(left_on='state')
    dupe_candidate_links = dupe_indexer.index(hospital_dupes)
    
    
    compare_dupes = rl.Compare()
    compare_dupes.string('given_name', 'given_name', threshold=0.80, method='levenshtein', label='given_name')
    compare_dupes.string('surname', 'surname', threshold=0.80, method='levenshtein', label='surname')
    # Query the fuzzy matches for address
    compare_dupes.string('address_1', 'address_1', threshold=0.85, method='levenshtein', label='address_1')
    # Query the fuzzy matches for address
    compare_dupes.string('address_2', 'address_2', threshold=0.85, method='levenshtein', label='address_2')
    compare_dupes.string('suburb', 'suburb', threshold=0.85, method='levenshtein', label='suburb')
    dupe_features = compare_dupes.compute(dupe_candidate_links, hospital_dupes)

    
    print(dupe_features.sum(axis=1).value_counts().sort_index(ascending=False))

    potential_dupes = dupe_features[dupe_features.sum(axis=1) > 3].reset_index()

    
    duplicate_data_index = potential_dupes['rec_id_1'] 
    
    unique_b = hospital_dupes[~hospital_dupes.index.isin(duplicate_data_index)].reset_index()

    
    output_json = { "unique data": json.loads(unique_b.to_json(orient='index')),
                       "All Records ": json.loads(hospital_dupes.reset_index().to_json(orient = 'index')),
                       "Duplicate ids ": json.loads(potential_dupes.to_json(orient = 'records')),
                  }
    
    return output_json
    