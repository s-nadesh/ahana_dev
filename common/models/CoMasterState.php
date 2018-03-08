<?php

namespace common\models;

use common\models\query\CoStateQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_master_state".
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
 * @property CoMasterCity[] $coMasterCities
 * @property CoMasterCountry $country
 */
class CoMasterState extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'co_master_state';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['country_id', 'state_name'], 'required'],
            [['country_id', 'created_by', 'modified_by', 'tenant_id'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at', 'tenant_id'], 'safe'],
            [['state_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'state_id' => 'State ID',
            'country_id' => 'Country Name',
            'state_name' => 'State Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCoMasterCities()
    {
        return $this->hasMany(CoMasterCity::className(), ['state_id' => 'state_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getCountry()
    {
        return $this->hasOne(CoMasterCountry::className(), ['country_id' => 'country_id']);
    }
    
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public static function find() {
        return new CoStateQuery(get_called_class());
    }
    
    public function fields() {
        $extend = [
            'country_name' => function ($model) {
                return (isset($model->country) ? $model->country->country_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'State Added Successfully (#' . $this->state_name . ' )';
        else
            $activity = 'State Updated Successfully (#' . $this->state_name . ' )';
        CoAuditLog::insertAuditLog(CoMasterCity::tableName(), $this->state_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}
