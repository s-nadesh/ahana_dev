<?php

namespace common\models;

use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_state".
 *
 * @property integer $state_id
 * @property integer $tenant_id
 * @property integer $country_id
 * @property string $state_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoCity[] $coCities
 * @property CoCountry $country
 */
class CoState extends GActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'co_state';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tenant_id', 'country_id', 'created_by', 'modified_by'], 'integer'],
            [['country_id', 'state_name'], 'required'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['state_name'], 'string', 'max' => 50],
            [['tenant_id', 'country_id', 'state_name', 'deleted_at'], 'unique', 'targetAttribute' => ['tenant_id', 'country_id', 'state_name', 'deleted_at'], 'message' => 'The combination of Tenant ID, Country ID, State Name and Deleted At has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'state_id' => 'State ID',
            'tenant_id' => 'Tenant ID',
            'country_id' => 'Country',
            'state_name' => 'State Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCoCities()
    {
        return $this->hasMany(CoCity::className(), ['state_id' => 'state_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getCountry()
    {
        return $this->hasOne(CoCountry::className(), ['country_id' => 'country_id']);
    }
}
