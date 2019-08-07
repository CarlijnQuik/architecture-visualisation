# import all relevant libraries (anaconda pandas needed)
import json
import sys
import csv_to_json as ctj
import log_to_csv_band as ltc  # change for jabref (ajpolog edited since that log was created)
import pandas as pd
import threading
from datetime import datetime
import numpy as np

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


class myThread (threading.Thread):
    def __init__(self, threadID, df_part, df):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.df_part = df_part
        self.df = df
    def run(self):
        result = ctj.get_links(self.df, self.df_part, 'Caller', 'Callee', input_file, "Dynamic", 'Message')
        self.result = result


def write_to_json(class_dict):
    # write the dictionary to a JSON file
    with open(file_name + "-class.json", 'w') as fp:
        json.dump(class_dict, fp)

    print("class file written")


if extension == 'csv':
    dataset = read_and_clean(input_file)  # read input file as pandas data frame
    df = pd.DataFrame(dataset)
    df['linkID'] = df['Dependency from'] + df['Dependency to']

    # create a dictionary and put the nodes and links from the dataset in it
    static_dict = {"nodes": ctj.get_nodes(df, df, 'Dependency from', 'Dependency to', file_name, "Static"),
                   "links": ctj.get_links(df, df, 'Dependency from', 'Dependency to', file_name, "Static", 'Used Entity (variable or method)')}

    print("static dict obtained")

    write_to_json(static_dict)

elif extension == 'log':
    dynamic_csv = ltc.get_csv(input_file, file_name + "-class.csv")  # convert ajpolog log to csv with required data
    dataset = read_and_clean(dynamic_csv)  # read input file as pandas data frames

    print("csv obtained")

    df = pd.DataFrame(dataset)
    df['linkID'] = df['Caller'] + df['Callee']
    df['reverseID'] = df['Callee'] + df['Caller']
    df['threadM'] = df['Thread'] + df['Message']
    df['msgID'] = df['linkID'] + df['Message']
    df['Start Time'] = pd.to_datetime(df['Start Time'], format='%H:%M:%S,%f')
    df['End Time'] = pd.to_datetime(df['End Time'], format='%H:%M:%S,%f')
    df['duration'] = df['End Time'] - df['Start Time']
    df['duration_seconds'] = df['duration'].dt.total_seconds()

    # Run on multiple threads to reduce processing time
    number_of_df_parts = 50
    df_parts = np.array_split(df,number_of_df_parts)
    
    threads = []
    for part in range (0,number_of_df_parts):
        threadName = str("thread") + str(part)
        threadName = myThread(part+1, df_parts[part], df)
        threads.append(threadName)

    all_links = []
    for thread in threads:
        start = datetime.now()
        print("started: ", thread.threadID, "at: ", start)
        thread.start()

    for thread in threads:    
        thread.join()
        print("finished", thread.threadID, "duration: ", (datetime.now() - start))
        all_links = all_links + thread.result

    list_ids = df['linkID'].tolist() + df['reverseID'].tolist()
    unique_links = list(dict.fromkeys(list_ids))
    print(len(unique_links))
    print(len(all_links))

    # create a dictionary and put the nodes and links from the dataset in it
    dynamic_dict = {"nodes": ctj.get_nodes(dataset, 'Caller', 'Callee', input_file, "Dynamic"),
                    "links": all_links}

    print("dynamic dict obtained")

    write_to_json(dynamic_dict)

