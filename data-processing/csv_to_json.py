list_node_names = []
list_nodes = []


def get_nodes(dataset, fr, to, file_name, data_type):
    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    target_nodes = dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        name = '.'.join(node.split('.'))
        # if '/'.join(node.split('.')[:-1]):
        node_dict = {'name': name,  # fullname
                     'origin': file_name,
                     'parent': '.'.join(node.split('.')[:-1]),
                     'dataType': data_type,
                     'root': '.'.join(node.split('.')[:1]),
                     'count': sum([True for n in target_nodes if n == name])}

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    return list_nodes


def get_all_nodes(node_name):
    node_parent = '.'.join(node_name.split('.')[:-1])
    if node_name not in list_node_names:
        list_node_names.append(node_name)
        if node_parent:
            get_all_nodes(node_parent)


def get_messages(dataset, dataset_part, fr, to, msg):
    dict_messages = {}
    list_msgs = dataset['msgID'].tolist()
    counter = 0
    # create a separate dictionary for all unique links
    for index, message in dataset_part.iterrows():
        counter = counter + 1
        if message[fr] and message[to]:
            if message[msg] != "Empty.field":
                message_count = list_msgs.count(message['msgID'])
            else:
                message_count = 1

            message_id = message['linkID'] + "//" + message[msg] + "//" + str(index)
            print("counter: ", counter, len(dataset_part))
            message_specs = get_dynamic_specs(message, message_count, dataset)
            dict_messages[message_id] = message_specs

    return dict_messages


def get_dynamic_specs(message, message_count, dataset):

    durations = dataset.loc[message['msgID'] == dataset['msgID']]['duration_seconds'].values.tolist()
    # sub_calls = dataset.loc[(dataset['Callee'] == link['Caller']) & (dataset['End Time'] <= link['End Time']) & (dataset['Start Time'] >= link['Start Time']) & (dataset['Message'] != link['Message'])]['Message'].values.tolist()

    message_specs = {'startDate': message['Start Date'],
                     'startTime': str(message['Start Time']).split(" ")[-1],
                     'endDate': message['End Date'],
                     'endTime': str(message['End Time']).split(" ")[-1],
                     'source': '.'.join(message['Caller'].split('.')),
                     'target': '.'.join(message['Callee'].split('.')),
                     'duration': message['duration_seconds'],  # get an integer
                     'thread': message['Thread'],
                     'callerID': message['Caller ID'],
                     'calleeID': message['Callee ID'],
                     'message': '.'.join(message['Message'].split('.')),
                     'linkID': message['linkID'],
                     'duration_sum': sum(durations),
                     'avg_duration': sum(durations) / message_count,
                     'count': message_count}

    return message_specs



