# import all relevant libraries (anaconda pandas needed)
import json
import sys
import csv_to_json as ctj
import log_to_csv_fish as ltc  # change for jabref (ajpolog edited since that log was created)
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


class myThread(threading.Thread):
    def __init__(self, threadID, df_part, df):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.df_part = df_part
        self.df = df
        self.result = "empty"

    def run(self):
        result = ctj.get_messages(self.df, self.df_part, 'Caller', 'Callee', 'Message')
        self.result = result


def write_to_json(class_dict):
    # write the dictionary to a JSON file
    with open(file_name + "-class.json", 'w') as fp:
        json.dump(class_dict, fp)

    print("class file written")


if extension == 'log':
    dynamic_csv = ltc.get_csv(input_file, file_name + "-class.csv")  # convert ajpolog log to csv with required data
    dataset = read_and_clean(dynamic_csv)  # read input file as pandas data frames

    print("csv obtained")

    df = pd.DataFrame(dataset)
    df['linkIDX'] = df['Caller'] + "//" + df['Callee']
    df['linkID'] = df['Caller'] + df['Callee']
    df['reverseID'] = df['Callee'] + df['Caller']
    df['msgID'] = df['Callee'] + "//" + df['Message']
    df['Start Time'] = pd.to_datetime(df['Start Time'], format='%H:%M:%S,%f')
    df['End Time'] = pd.to_datetime(df['End Time'], format='%H:%M:%S,%f')
    df['duration'] = df['End Time'] - df['Start Time']
    df['duration_seconds'] = df['duration'].dt.total_seconds()

    # Run on multiple threads to reduce processing time
    number_of_df_parts = 50
    df_parts = np.array_split(df, number_of_df_parts)

    threads = []
    for part in range(0, number_of_df_parts):
        threadName = str("thread") + str(part)
        threadName = myThread(part + 1, df_parts[part], df)
        threads.append(threadName)

    messages = {}
    for thread in threads:
        start = datetime.now()
        print("started: ", thread.threadID, "at: ", start)
        thread.start()

    for thread in threads:
        thread.join()
        print("finished", thread.threadID, "duration: ", (datetime.now() - start))
        messages.update(thread.result)

    print("messages obtained", len(messages))

    link_ids = dataset['linkID'].tolist()
    list_ids = dataset['linkIDX'].tolist()
    unique_link_ids = []

    for id_l in list_ids:
        caller = id_l.split("//")[0]
        callee = id_l.split("//")[1]
        normal_id = caller + "//" + callee
        reverse_id = callee + "//" + caller

        if normal_id not in unique_link_ids and reverse_id not in unique_link_ids:
            unique_link_ids.append(id_l)

    all_links = []
    counter = 0
    for link in unique_link_ids:
        counter = counter + 1
        print(counter,len(unique_link_ids))
        caller = link.split("//")[0]
        callee = link.split("//")[1]
        normal_id = caller + callee
        reverse_id = callee + caller

        sub_links = [v for k, v in messages.items() if k.split("//")[0] == normal_id or k.split("//")[0] == reverse_id]
        count = link_ids.count(normal_id) + link_ids.count(reverse_id)

        sum_duration_sublinks = 0
        for msg in sub_links:
            sum_duration_sublinks = sum_duration_sublinks + msg['duration']

        link_dict = {'source': caller,
                     'target': callee,
                     'origin': file_name,
                     'count': count,
                     'linkID': normal_id,
                     'reverseID': reverse_id,
                     'sum_subLinks': sum_duration_sublinks,
                     'subLinks': sub_links}

        all_links.append(link_dict)

    # print("dict links", all_links, len(all_links))

    # create a dictionary and put the nodes and links from the dataset in it
    dynamic_dict = {"nodes": ctj.get_nodes(dataset, 'Caller', 'Callee', input_file, "Dynamic"),
                    "links": all_links,
                    "messages": list(messages.values())}

    print("dynamic dict obtained")

    write_to_json(dynamic_dict)
