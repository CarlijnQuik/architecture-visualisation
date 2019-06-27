# import all relevant libraries (anaconda pandas needed)
import json
import sys

import csv_to_json as ctj
import log_to_csv as ltc
import pandas as pd

# get input files from command prompt
if len(sys.argv) > 1:
    input_file = sys.argv[1]

else:
    print("Please provide a csv or log file")
    raise SystemExit

extension = ''.join(input_file.split('.')[-1])

# name output file
file_name = '.'.join(input_file.split('.')[:-1])

if extension == 'csv':
    # read input file as pandas data frames
    dataset = pd.read_csv(input_file, sep=';')

    # remove NaN from fields
    dataset.fillna("Empty.field", inplace=True)

    # create a dictionary and put the nodes and links from the dataset in it
    static_dict = {"nodes": ctj.get_nodes(dataset, 'Dependency from', 'Dependency to', file_name, "Static"),
                   "links": ctj.get_static_links(dataset, file_name)}

    # write the dictionary to JSON files
    with open(file_name + "-static.json", 'w') as fp:
        json.dump(static_dict, fp)

else:
    # convert ajpolog log to csv with required data
    dynamic_csv = ltc.get_csv(input_file, file_name + "-dynamic.csv")
    dataset = pd.read_csv(dynamic_csv, sep=';')

    # remove NaN from fields
    dataset.fillna("Empty.field", inplace=True)

    # create a dictionary and put the nodes and links from the dataset in it
    dynamic_dict = {"nodes": ctj.get_nodes(dataset, 'Caller', 'Callee', input_file, "Dynamic"),
                    "links": ctj.get_dynamic_links(dataset, input_file)}

    # write the dictionary to JSON file
    with open(file_name + "-dynamic.json", 'w') as fp:
        json.dump(dynamic_dict, fp)








