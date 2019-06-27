# import all relevant libraries (anaconda pandas needed)
import json
import sys
import csv_to_json as ctj
import log_to_csv as ltc
import pandas as pd
import classes_to_packages as ctp

# get input files from command prompt
if len(sys.argv) > 1:
    input_file = sys.argv[1]
else:
    print("Please provide a csv or log file")
    raise SystemExit

extension = ''.join(input_file.split('.')[-1])
file_name = '.'.join(input_file.split('.')[:-1])  # name output file


def read_and_clean(file):
    chosen_dataset = pd.read_csv(file, sep=';')  # read input file as pandas data frames
    chosen_dataset.fillna("Empty.field", inplace=True)  # remove NaN from fields
    return chosen_dataset


if extension == 'csv':
    dataset = read_and_clean(input_file)  # read input file as pandas data frame

    # create a dictionary and put the nodes and links from the dataset in it
    class_dict = {"nodes": ctj.get_nodes(dataset, 'Dependency from', 'Dependency to', file_name, "Static"),
                  "links": ctj.get_static_links(dataset, file_name)}

else:
    dynamic_csv = ltc.get_csv(input_file, file_name + "-dynamic.csv")  # convert ajpolog log to csv with required data
    dataset = read_and_clean(dynamic_csv)  # read input file as pandas data frames

    # create a dictionary and put the nodes and links from the dataset in it
    class_dict = {"nodes": ctj.get_nodes(dataset, 'Caller', 'Callee', input_file, "Dynamic"),
                  "links": ctj.get_dynamic_links(dataset, input_file)}


# write the dictionary to a JSON file
with open(file_name + "-class.json", 'w') as fp:
    json.dump(class_dict, fp)

# get package data
package_dict = {"nodes": ctp.get_package_nodes(class_dict["nodes"]),
                "links": ctp.get_package_links(class_dict["links"])}

# write the dictionary to a JSON file
with open(file_name + "-package.json", 'w') as fp:
    json.dump(package_dict, fp)
