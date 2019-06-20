import pymongo

# client = pymongo.MongoClient('mongodb://localhost:27017/')
# db = client["archvis"]
# nodes_db = db['nodes']
# static_links_db = db['static_links']
# dynamic_links_db = db['dynamic_links']


# return a list of unique node names
def get_nodes(dataset, fr, to, file_name, data_type):
    list_nodes = []

    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        parent = '/'.join(node.split('.')[:-1])
        #print(node, parent)
        node_dict = {'name': '/'.join(node.split('.')),  # fullname
                     'origin': file_name,
                     'parent': parent,
                     'dataType': data_type,
                     'count': int(nodes.count(node))}

        # check if the parent is a node, otherwise it is a root node
        # if parent in unique_nodes:
        #     node_dict['parent'] = parent

        # # if the node is not already present in the db
        # if not nodes_db.find_one({"name": '/'.join(node.split('.'))}):
        # # insert in mongodb
        # nodes_db.insert_one(node_dict)

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


# return a list of links
def get_static_links(dataset, file_name):
    list_links = []
    unique_links = []

    # merge dependency from and to columns to one list
    messages = dataset['Used Entity (variable or method)'].tolist()
    messages = [x for x in messages if x != "Is.Empty"]

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_id = row['Dependency from'] + row['Dependency to']
        if link_id not in unique_links:
            unique_links.append(link_id)
            link_dict = {'message': '/'.join(row['Used Entity (variable or method)'].split('.')),
                         'source':  '/'.join(row['Dependency from'].split('.')),
                         'target': '/'.join(row['Dependency to'].split('.')),
                         'type': row['Dependency type'],
                         'subtype': row['Sub type'],
                         'line': row['Line'],
                         'direct': row['Direct/Indirect'],
                         'inheritance': row['Inheritance Related'],
                         'innerclass': row['Inner Class Related'],
                         'origin': file_name,
                         'dataType': "Static",
                         'count': int(messages.count(row['Used Entity (variable or method)']))}

            # append the dictionary to the list of link dictionaries
            list_links.append(link_dict)

    # insert in mongodb
    # static_links_db.insert_many(list_links)
    return list_links


# return a list of links
def get_dynamic_links(dataset, file_name):
    list_links = []
    unique_links = []

    # merge dependency from and to columns to one list
    messages = dataset['Message'].tolist()
    messages = [x for x in messages if x != "Is.Empty"]

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_id = row['Caller'] + row['Callee']
        if link_id not in unique_links:
            unique_links.append(link_id)
            link_dict = {'startDate': row['Start Date'],
                         'startTime': row['Start Time'],
                         'endDate': row['End Date'],
                         'endTime': row['End Time'],
                         'thread': row['Thread'],
                         'callerID': row['Caller ID'],
                         'calleeID': row['Callee ID'],
                         'source': '/'.join(row['Caller'].split('.')),
                         'target': '/'.join(row['Callee'].split('.')),
                         'message': '/'.join(row['Message'].split('.')),
                         'origin': file_name,
                         'dataType': "Dynamic",
                         'count': int(messages.count(row['Message']))}

            # append the dictionary to the list of link dictionaries
            list_links.append(link_dict)

    # insert in mongodb
    # dynamic_links_db.insert_many(list_links)
    return list_links



