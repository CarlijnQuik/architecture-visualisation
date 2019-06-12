# import all relevant libraries (anaconda pandas needed)
import pandas as pd


def delete_rows(dataset, column, string):
    to_delete = dataset[dataset[column].str.startswith(string)].index

    # delete these row indexes from dataFrame
    dataset.drop(to_delete, inplace=True)


def filter_dynamic(dataset):
    # remove NaN from fields
    dataset.fillna("Is.Empty", inplace=True)

    # filter dataset nodes
    delete_rows(dataset, 'Caller', 'java')
    delete_rows(dataset, 'Callee', 'java')
    delete_rows(dataset, 'Caller', 'xLibraries')
    delete_rows(dataset, 'Callee', 'xLibraries')

    return dataset


def filter_static(dataset):
    # remove NaN from fields
    dataset.fillna("Is.Empty", inplace=True)

    # # filter dataset nodes
    delete_rows(dataset, 'Dependency from', 'java')
    delete_rows(dataset, 'Dependency to', 'java')
    delete_rows(dataset, 'Dependency from', 'xLibraries')
    delete_rows(dataset, 'Dependency to', 'xLibraries')

    # filter out dependencies of type call
    to_delete = dataset[dataset['Dependency type'] != 'Call'].index
    dataset.drop(to_delete, inplace=True)

    return dataset
