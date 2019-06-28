# import all relevant libraries (anaconda pandas needed)
import json
import sys
import csv_to_json as ctj
import log_to_csv as ltc  # change for jabref (ajpolog edited since that log was created)
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


def write_to_json(class_dict):
    # write the dictionary to a JSON file
    with open(file_name + "-class.json", 'w') as fp:
        json.dump(class_dict, fp)

    print("class file written")

    # get package data
    package_dict = {"nodes": ctp.get_package_nodes(class_dict["nodes"]),
                    "links": ctp.get_package_links(class_dict["links"])}

    print("package dict obtained")

    # write the dictionary to a JSON file
    with open(file_name + "-package.json", 'w') as fp:
        json.dump(package_dict, fp)

    print("package file written")


if extension == 'csv':
    dataset = read_and_clean(input_file)  # read input file as pandas data frame

    # create a dictionary and put the nodes and links from the dataset in it
    static_dict = {"nodes": ctj.get_nodes(dataset, 'Dependency from', 'Dependency to', file_name, "Static"),
                   "links": ctj.get_static_links(dataset, file_name)}

    print("static dict obtained")

    write_to_json(static_dict)

elif extension == 'log':
    dynamic_csv = ltc.get_csv(input_file, file_name + "-class.csv")  # convert ajpolog log to csv with required data
    dataset = read_and_clean(dynamic_csv)  # read input file as pandas data frames

    print("csv obtained")

    # create a dictionary and put the nodes and links from the dataset in it
    dynamic_dict = {"nodes": ctj.get_nodes(dataset, 'Caller', 'Callee', input_file, "Dynamic"),
                    "links": ctj.get_dynamic_links(dataset, input_file)}

    print("dynamic dict obtained")

    write_to_json(dynamic_dict)
